import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { breakpoints } from '@openedx/paragon';

import {
  createTestQueryClient, initializeMockApp, getTestStoreIds, initializeTestStore, logUnhandledRequests, seedQueryData,
  waitFor,
} from '@src/setupTest';
import { getCourseOutline } from '@src/courseware/data/api';
import { coursewareQueryKeys } from '@src/courseware/data/queryKeys';
import SidebarState from '@src/tests/SidebarState';
import { SidebarProvider } from '../../../SidebarContext';
import SidebarUnit from './SidebarUnit';
import { ID } from '../constants';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
  sendTrackingLogEvent: jest.fn(),
}));

initializeMockApp();

describe('<SidebarUnit />', () => {
  let store = {};
  let courseId;
  let outline;
  let unit;
  let sequenceId;

  const { innerWidth: originalInnerWidth } = window;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const initTestData = async (options) => {
    store = await initializeTestStore(options);
    courseId = getTestStoreIds(store).courseId;
    outline = await getCourseOutline(courseId);
    [sequenceId] = Object.keys(outline.sequences);
    const sequence = outline.sequences[sequenceId];
    unit = outline.units[sequence.unitIds[0]];

    // The outline is the stored sidebar, so it is open on any viewport.
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify(ID));
  };

  const currentSidebar = () => screen.getByTestId('current-sidebar').textContent;

  function renderWithProvider(props = {}, pathname = undefined) {
    const queryClient = createTestQueryClient(store);
    seedQueryData(queryClient, coursewareQueryKeys.courseOutline(courseId), outline);
    seedQueryData(queryClient, coursewareQueryKeys.sidebarToggles(courseId), { enableCompletionTracking: true });
    const sidebarUnit = (
      <SidebarUnit
        isFirst
        id={unit.id}
        courseId="course123"
        sequenceId={sequenceId}
        unit={{ ...unit, icon: 'video', isLocked: false }}
        isActive={false}
        activeUnitId={unit.id}
        isCompletionTrackingEnabled
        {...props}
      />
    );
    const { container } = render(
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider locale="en">
            <MemoryRouter initialEntries={[{ pathname: pathname ?? `/course/${courseId}` }]}>
              <SidebarProvider courseId={courseId} unitId={unit.id} widgets={[]}>
                <Routes>
                  <Route path="/course/:courseId" element={sidebarUnit} />
                  <Route path="/course/:courseId/:sequenceId/:unitId" element={sidebarUnit} />
                  <Route path="/preview/course/:courseId" element={sidebarUnit} />
                </Routes>
                <SidebarState />
              </SidebarProvider>
            </MemoryRouter>
          </IntlProvider>
        </QueryClientProvider>
      </AppProvider>,
    );
    return container;
  }

  it('renders correctly when unit is incomplete', async () => {
    await initTestData();
    const container = renderWithProvider();

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is complete and tracking enabled', async () => {
    await initTestData();
    const container = renderWithProvider({ unit: { ...unit, complete: true } });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).toBeInTheDocument();
    expect(container.querySelector('.border-top')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is not first and icon is not set', async () => {
    await initTestData();
    const container = renderWithProvider({
      isFirst: false,
      unit: { ...unit, icon: null },
    });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.border-top')).toBeInTheDocument();
  });

  it('renders correctly when unit is locked', async () => {
    await initTestData();
    renderWithProvider({
      unit: { ...unit, isLocked: true },
    });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
  });

  describe('When a unit is clicked', () => {
    it('sends log event correctly', async () => {
      const user = userEvent.setup();
      await initTestData();
      renderWithProvider({ unit: { ...unit } });
      const logData = {
        id: unit.id,
        current_tab: 1,
        tab_count: 1,
        target_id: unit.id,
        target_tab: 1,
        widget_placement: 'left',
      };

      await user.click(screen.getByText(unit.title));

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', logData);
      expect(sendTrackingLogEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', logData);
    });

    it('sends the completion check for the unit navigated away from to its own sequence, not the one navigated to', async () => {
      const user = userEvent.setup();
      await initTestData();
      const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      const completionUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/get_completion`;
      axiosMock.onPost(completionUrl).reply(201, { complete: true });
      logUnhandledRequests(axiosMock);
      renderWithProvider(
        { sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@another' },
        `/course/${courseId}/${sequenceId}/${unit.id}`,
      );

      await user.click(screen.getByText(unit.title));

      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
      expect(axiosMock.history.post[0].url).toEqual(completionUrl);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ usage_key: unit.id });
    });

    it('leaves sidebar open in desktop mode', async () => {
      const user = userEvent.setup();
      window.innerWidth = breakpoints.extraExtraLarge.minWidth;
      await initTestData();
      renderWithProvider({ unit: { ...unit } });
      await user.click(screen.getByText(unit.title));

      expect(currentSidebar()).toBe(ID);
    });

    it('closes sidebar on mobile devices', async () => {
      const user = userEvent.setup();
      await initTestData();
      renderWithProvider({ unit: { ...unit } });
      expect(currentSidebar()).toBe(ID);

      await user.click(screen.getByText(unit.title));

      expect(currentSidebar()).toBe('null');
    });
  });

  describe('UnitLinkWrapper', () => {
    describe('course in preview mode', () => {
      beforeEach(async () => {
        await initTestData();
        renderWithProvider({ unit: { ...unit } }, `/preview/course/${courseId}`);
      });

      it('href includes /preview', async () => {
        const unitLink = screen.getByText(unit.title).closest('a');
        const linkHref = unitLink.getAttribute('href');

        expect(linkHref.includes('/preview/')).toBeTruthy();
      });
    });

    describe('course in live mode', () => {
      beforeEach(async () => {
        await initTestData();
        renderWithProvider({ unit: { ...unit } });
      });

      it('href does not include /preview/', async () => {
        const unitLink = screen.getByText(unit.title).closest('a');
        const linkHref = unitLink.getAttribute('href');

        expect(linkHref.includes('/preview/')).toBeFalsy();
      });
    });
  });
});

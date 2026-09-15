import { AppProvider } from '@edx/frontend-platform/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';

import {
  createTestQueryClient, initializeMockApp, initializeTestStore, seedQueryData,
} from '@src/setupTest';
import { getCourseOutline } from '@src/courseware/data/api';
import { coursewareQueryKeys } from '@src/courseware/data/queryKeys';
import SidebarContext from '../../../SidebarContext';
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
  let defaultSidebarContext;

  const initTestData = async (options) => {
    store = await initializeTestStore(options);
    courseId = store.getState().courseware.courseId;
    outline = await getCourseOutline(courseId);
    [sequenceId] = Object.keys(outline.sequences);
    const sequence = outline.sequences[sequenceId];
    unit = outline.units[sequence.unitIds[0]];

    defaultSidebarContext = {
      toggleSidebar: jest.fn(),
      currentSidebar: ID,
    };
  };

  function renderWithProvider(props = {}, sidebarContext = defaultSidebarContext, pathname = undefined) {
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
            <SidebarContext.Provider value={{ ...sidebarContext }}>
              <MemoryRouter initialEntries={[{ pathname: pathname ?? `/course/${courseId}` }]}>
                <Routes>
                  <Route path="/course/:courseId" element={sidebarUnit} />
                  <Route path="/preview/course/:courseId" element={sidebarUnit} />
                </Routes>
              </MemoryRouter>
            </SidebarContext.Provider>
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

    it('leaves sidebar open in desktop mode', async () => {
      const user = userEvent.setup();
      await initTestData();
      renderWithProvider({ unit: { ...unit } });
      await user.click(screen.getByText(unit.title));

      expect(defaultSidebarContext.toggleSidebar).not.toHaveBeenCalled();
    });

    it('closes sidebar on mobile devices', async () => {
      const user = userEvent.setup();
      await initTestData();
      renderWithProvider({ unit: { ...unit } }, { ...defaultSidebarContext, shouldDisplayFullScreen: true });
      await user.click(screen.getByText(unit.title));

      expect(defaultSidebarContext.toggleSidebar).toHaveBeenCalledTimes(1);
      expect(defaultSidebarContext.toggleSidebar).toHaveBeenCalledWith(null);
    });
  });

  describe('UnitLinkWrapper', () => {
    describe('course in preview mode', () => {
      beforeEach(async () => {
        await initTestData();
        renderWithProvider({ unit: { ...unit } }, { ...defaultSidebarContext, shouldDisplayFullScreen: true }, `/preview/course/${courseId}`);
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
        renderWithProvider({ unit: { ...unit } }, { ...defaultSidebarContext, shouldDisplayFullScreen: true });
      });

      it('href does not include /preview/', async () => {
        const unitLink = screen.getByText(unit.title).closest('a');
        const linkHref = unitLink.getAttribute('href');

        expect(linkHref.includes('/preview/')).toBeFalsy();
      });
    });
  });
});

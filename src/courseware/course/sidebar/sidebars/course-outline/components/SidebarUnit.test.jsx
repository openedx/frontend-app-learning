import { getAnalyticsService, getSiteConfig } from '@openedx/frontend-base';
import { MemoryRouter } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { breakpoints } from '@openedx/paragon';

import { getCourseOutline } from '@src/courseware/data/api';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { CourseParamsProvider } from '@src/generic/course-params';
import OutlineQueryGate from '@src/tests/OutlineQueryGate';
import { render } from '@src/tests/render';
import SidebarState from '@src/tests/SidebarState';
import { SidebarProvider } from '../../../SidebarContext';
import SidebarUnit from './SidebarUnit';
import { ID } from '../constants';

describe('<SidebarUnit />', () => {
  let courseId;
  let axiosMock;
  let unit;
  let sequenceId;
  const { sendTrackEvent, sendTrackingLogEvent } = getAnalyticsService();

  const { innerWidth: originalInnerWidth } = window;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const initTestData = async (options) => {
    ({ courseId, axiosMock } = mockCourseRequests(options));
    const outline = await getCourseOutline(courseId);
    [sequenceId] = Object.keys(outline.sequences);
    const sequence = outline.sequences[sequenceId];
    unit = outline.units[sequence.unitIds[0]];

    // The outline is the stored sidebar, so it is open on any viewport.
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify(ID));
  };

  const currentSidebar = () => screen.getByTestId('current-sidebar').textContent;

  // The unit reads the outline from its query, which mockCourseRequests answers.
  // `activeSequenceId` is the sequence the courseware shows; `isPreview` puts it on the preview routes.
  async function renderWithProvider(props = {}, { activeSequenceId = undefined, isPreview = false } = {}) {
    const sidebarUnit = (
      <OutlineQueryGate>
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
      </OutlineQueryGate>
    );
    const { container } = render(
      <MemoryRouter>
        <CourseParamsProvider courseId={courseId} sequenceId={activeSequenceId} isPreview={isPreview}>
          <SidebarProvider courseId={courseId} unitId={unit.id} widgets={[]}>
            {sidebarUnit}
            <SidebarState />
          </SidebarProvider>
        </CourseParamsProvider>
      </MemoryRouter>,
    );
    await screen.findByText(unit.title);
    return container;
  }

  it('renders correctly when unit is incomplete', async () => {
    await initTestData();
    const container = await renderWithProvider();

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is complete and tracking enabled', async () => {
    await initTestData();
    const container = await renderWithProvider({ unit: { ...unit, complete: true } });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).toBeInTheDocument();
    expect(container.querySelector('.border-top')).not.toBeInTheDocument();
  });

  it('renders correctly when unit is not first and icon is not set', async () => {
    await initTestData();
    const container = await renderWithProvider({
      isFirst: false,
      unit: { ...unit, icon: null },
    });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(container.querySelector('.border-top')).toBeInTheDocument();
  });

  it('renders correctly when unit is locked', async () => {
    await initTestData();
    await renderWithProvider({
      unit: { ...unit, isLocked: true },
    });

    expect(screen.getByText(unit.title)).toBeInTheDocument();
  });

  describe('When a unit is clicked', () => {
    it('sends log event correctly', async () => {
      const user = userEvent.setup();
      await initTestData();
      await renderWithProvider({ unit: { ...unit } });
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
      const completionUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/xblock/${sequenceId}/handler/get_completion`;
      axiosMock.onPost(completionUrl).reply(201, { complete: true });
      await renderWithProvider(
        { sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@another' },
        { activeSequenceId: sequenceId },
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
      await renderWithProvider({ unit: { ...unit } });
      await user.click(screen.getByText(unit.title));

      expect(currentSidebar()).toBe(ID);
    });

    it('closes sidebar on mobile devices', async () => {
      const user = userEvent.setup();
      await initTestData();
      await renderWithProvider({ unit: { ...unit } });
      expect(currentSidebar()).toBe(ID);

      await user.click(screen.getByText(unit.title));

      expect(currentSidebar()).toBe('null');
    });
  });

  describe('UnitLinkWrapper', () => {
    it('links to the unit under /preview in preview mode', async () => {
      await initTestData();
      await renderWithProvider({ unit: { ...unit } }, { isPreview: true });

      expect(screen.getByText(unit.title).closest('a'))
        .toHaveAttribute('href', `/learning/preview/course/course123/${sequenceId}/${unit.id}`);
    });

    it('links to the unit in live mode', async () => {
      await initTestData();
      await renderWithProvider({ unit: { ...unit } });

      expect(screen.getByText(unit.title).closest('a')).toHaveAttribute('href', unitPath('course123', sequenceId, unit.id));
    });
  });
});

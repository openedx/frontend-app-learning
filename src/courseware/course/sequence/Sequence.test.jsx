import { Factory } from 'rosie';
import { getAnalyticsService, getSiteConfig, WidgetOperationTypes } from '@openedx/frontend-base';
import { breakpoints } from '@openedx/paragon';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import routes from '@src/routes';
import { sequenceContainerSlotId } from '@src/slots/SequenceContainerSlot';
import { sequenceNavigationSlotId } from '@src/slots/SequenceNavigationSlot';
import { loadUnit, mockCourseRequests, unitPath } from '@src/tests/courseware';
import { renderRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { logSequenceEvent } from './Sequence';

// The legacy app's upgrade panel cases go with the upgrade widget, which is not ported.

const { sendTrackEvent, sendTrackingLogEvent } = getAnalyticsService();

describe('Sequence', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
    'block',
    { type: 'vertical' },
    { courseId },
  ));

  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
    global.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderSequence = (sequenceId, unitId) => renderRoutes(routes, unitPath(courseId, sequenceId, unitId));

  it('renders the no-content message with no sequence to show', async () => {
    const { axiosMock } = mockCourseRequests({ courseMetadata, unitBlocks });
    // With no resume position, the course root stays put.
    axiosMock.onGet(`${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`).reply(500);
    renderRoutes(routes, `/learning/course/${courseId}`);

    expect(await screen.findByText('There is no content here.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('displays the no-content message for a unit that is not in the sequence', async () => {
    const { sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks });
    renderSequence(sequenceId, 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@not_in_this_sequence');

    expect(await screen.findByText('There is no content here.')).toBeInTheDocument();
    expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('content-iframe-test-id')).not.toBeInTheDocument();
  });

  it('renders correctly for gated content', async () => {
    const sequenceBlocks = [Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId },
    )];
    const gatedContent = {
      gated: true,
      prereq_id: `${sequenceBlocks[0].id}-prereq`,
      prereq_section_name: `${sequenceBlocks[0].display_name}-prereq`,
      gated_section_name: sequenceBlocks[0].display_name,
    };
    const sequenceMetadata = [Factory.build(
      'sequenceMetadata',
      { gated_content: gatedContent },
      { courseId, unitBlocks, sequenceBlock: sequenceBlocks[0] },
    )];
    mockCourseRequests({
      courseMetadata, unitBlocks, sequenceBlocks, sequenceMetadata,
    });
    const { container } = renderSequence(sequenceBlocks[0].id, unitBlocks[0].id);

    expect(await screen.findByText('Content Locked')).toBeInTheDocument();
    // The `Go To Prerequisite Section` button and the course outline trigger.
    expect(screen.getAllByRole('button')).toHaveLength(2);
    // No `Next` link.
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    const unitContainer = container.querySelector('.unit-container');
    expect(unitContainer.querySelector('svg')).toHaveClass('fa-lock');
    expect(screen.getByText(/You must complete the prerequisite/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go To Prerequisite Section' })).toBeInTheDocument();
    expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
  });

  it('renders correctly for hidden after due content', async () => {
    const sequenceBlocks = [Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId },
    )];
    const sequenceMetadata = [Factory.build(
      'sequenceMetadata',
      { is_hidden_after_due: true },
      { courseId, unitBlocks, sequenceBlock: sequenceBlocks[0] },
    )];
    mockCourseRequests({
      courseMetadata, unitBlocks, sequenceBlocks, sequenceMetadata,
    });
    renderSequence(sequenceBlocks[0].id, unitBlocks[0].id);

    expect(await screen.findByText('The due date for this assignment has passed.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'progress page' }))
      .toHaveAttribute('href', `/learning/course/${courseId}/progress`);

    // No normal content or navigation should be rendered. Just the above alert.
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(1);
  });

  it('displays error message on sequence load failure', async () => {
    const { axiosMock, sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks });
    axiosMock.onGet(`${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${sequenceId}`).reply(500);
    renderSequence(sequenceId, unitBlocks[0].id);

    expect(await screen.findByText('There was an error loading this course.')).toBeInTheDocument();
  });

  it('handles loading unit', async () => {
    const { sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks });
    renderSequence(sequenceId, unitBlocks[0].id);
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();
    // The top `Previous` and `Next` buttons, `Bookmark` and the course outline trigger.
    await waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(4));
    // No `Next` link until the unit has loaded.
    expect(screen.queryAllByRole('link')).toHaveLength(0);

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    // At this point there will be 2 `Previous` buttons.
    expect(screen.getAllByRole('button', { name: /previous/i }).length).toEqual(2);
    // Renders `Next` for the top (button) and bottom (link) unit navigations.
    expect(screen.getAllByRole('button', { name: /next/i }).length).toEqual(1);
    expect(screen.getAllByRole('link', { name: /next/i }).length).toEqual(1);
  });

  it('renders the course license', async () => {
    const { sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks });
    renderSequence(sequenceId, unitBlocks[0].id);

    expect(await screen.findByText('All Rights Reserved')).toBeInTheDocument();
  });

  it('passes the sequence container slot what it is about', async () => {
    const Widget = jest.fn(() => null);
    addSlotOperations([{
      slotId: sequenceContainerSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.APPEND,
      component: Widget,
    }]);
    const { sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks });
    renderSequence(sequenceId, unitBlocks[0].id);
    await screen.findByTestId('content-iframe-test-id');

    expect(Widget).toHaveBeenLastCalledWith({ courseId, sequenceId, unitId: unitBlocks[0].id }, {});
  });

  describe('sequence and unit navigation buttons', () => {
    const sequenceBlocks = [Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId },
    ), Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId },
    )];

    beforeEach(() => {
      mockCourseRequests({ courseMetadata, unitBlocks, sequenceBlocks });
    });

    it('navigates to the previous sequence if the unit is the first in the sequence', async () => {
      const user = userEvent.setup();
      const { router } = renderSequence(sequenceBlocks[1].id, unitBlocks[0].id);
      expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: /previous/i }));
      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.previous_selected', {
        current_tab: 1,
        id: unitBlocks[0].id,
        tab_count: unitBlocks.length,
        widget_placement: 'bottom',
      });
      // The previous sequence's last unit.
      await waitFor(() => expect(router.state.location.pathname).toEqual(
        unitPath(courseId, sequenceBlocks[0].id, unitBlocks[unitBlocks.length - 1].id),
      ));
    });

    it('navigates to the next sequence if the unit is the last in the sequence', async () => {
      const user = userEvent.setup();
      const { router } = renderSequence(sequenceBlocks[0].id, unitBlocks[unitBlocks.length - 1].id);
      await screen.findByTestId('content-iframe-test-id');
      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

      await user.click(screen.getByRole('link', { name: /next/i }));
      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.next_selected', {
        current_tab: unitBlocks.length,
        id: unitBlocks[unitBlocks.length - 1].id,
        tab_count: unitBlocks.length,
        widget_placement: 'bottom',
      });
      // The next sequence's first unit.
      await waitFor(() => expect(router.state.location.pathname).toEqual(
        unitPath(courseId, sequenceBlocks[1].id, unitBlocks[0].id),
      ));
    });

    it('navigates to the previous/next unit if the unit is not in the corner of the sequence', async () => {
      const user = userEvent.setup();
      const { router } = renderSequence(sequenceBlocks[0].id, unitBlocks[1].id);
      expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: /previous/i }));
      await waitFor(() => expect(router.state.location.pathname).toEqual(
        unitPath(courseId, sequenceBlocks[0].id, unitBlocks[0].id),
      ));

      await user.click(await screen.findByRole('button', { name: /next/i }));
      await waitFor(() => expect(router.state.location.pathname).toEqual(
        unitPath(courseId, sequenceBlocks[0].id, unitBlocks[1].id),
      ));

      expect(sendTrackEvent).toHaveBeenCalledTimes(2);
    });

    it('handles the `Previous` buttons for the first unit in the first sequence', async () => {
      const user = userEvent.setup();
      const { router } = renderSequence(sequenceBlocks[0].id, unitBlocks[0].id);
      await screen.findByTestId('content-iframe-test-id');
      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

      const previousButtons = screen.getAllByRole('button', { name: /previous/i });
      previousButtons.forEach(button => expect(button).toBeDisabled());
      await Promise.all(previousButtons.map(button => user.click(button)));

      expect(router.state.location.pathname).toEqual(unitPath(courseId, sequenceBlocks[0].id, unitBlocks[0].id));
      expect(sendTrackEvent).not.toHaveBeenCalled();
    });

    it('handles the `Next` buttons for the last unit in the last sequence', async () => {
      const user = userEvent.setup();
      const lastUnitPath = unitPath(courseId, sequenceBlocks[1].id, unitBlocks[unitBlocks.length - 1].id);
      const { router } = renderSequence(sequenceBlocks[1].id, unitBlocks[unitBlocks.length - 1].id);
      await screen.findByTestId('content-iframe-test-id');
      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

      const nextButtons = screen.getAllByRole('button', { name: /next/i });
      nextButtons.forEach(button => expect(button).toBeDisabled());
      await Promise.all(nextButtons.map(button => user.click(button)));

      expect(router.state.location.pathname).toEqual(lastUnitPath);
      expect(sendTrackEvent).not.toHaveBeenCalled();
    });

    it('logs the tab and the placement of a move made through the unit tab strip', async () => {
      const user = userEvent.setup();
      const onNavigateFrom = jest.fn(({ onNavigate, nextHandler, previousHandler }) => (
        <>
          <button type="button" onClick={() => onNavigate(unitBlocks[2].id)}>tab</button>
          <button type="button" onClick={nextHandler}>strip next</button>
          <button type="button" onClick={previousHandler}>strip previous</button>
        </>
      ));
      addSlotOperations([{
        slotId: sequenceNavigationSlotId,
        id: 'org.example.widget',
        op: WidgetOperationTypes.APPEND,
        component: onNavigateFrom,
      }]);
      renderSequence(sequenceBlocks[0].id, unitBlocks[1].id);

      await user.click(await screen.findByRole('button', { name: 'tab' }));
      await user.click(screen.getByRole('button', { name: 'strip next' }));
      await user.click(screen.getByRole('button', { name: 'strip previous' }));

      expect(sendTrackEvent.mock.calls).toEqual([
        ['edx.ui.lms.sequence.tab_selected', {
          current_tab: 2, id: unitBlocks[1].id, tab_count: 3, widget_placement: 'top', target_tab: 3,
        }],
        ['edx.ui.lms.sequence.next_selected', {
          current_tab: 2, id: unitBlocks[1].id, tab_count: 3, widget_placement: 'top',
        }],
        ['edx.ui.lms.sequence.previous_selected', {
          current_tab: 2, id: unitBlocks[1].id, tab_count: 3, widget_placement: 'top',
        }],
      ]);
    });

    it('shows the no-content message for a sequence with no units', async () => {
      const testSequenceBlocks = [Factory.build(
        'block',
        { type: 'sequential', children: unitBlocks.map(block => block.id) },
        { courseId },
      ), Factory.build(
        'block',
        { type: 'sequential', children: [] },
        { courseId },
      )];
      const testSequenceMetadata = testSequenceBlocks.map(block => Factory.build(
        'sequenceMetadata',
        {},
        { courseId, unitBlocks: block.children.length ? unitBlocks : [], sequenceBlock: block },
      ));
      mockCourseRequests({
        courseMetadata,
        unitBlocks,
        sequenceBlocks: testSequenceBlocks,
        sequenceMetadata: testSequenceMetadata,
      });

      renderSequence(testSequenceBlocks[1].id);

      expect(await screen.findByText('There is no content here.')).toBeInTheDocument();
      expect(screen.queryByTestId('content-iframe-test-id')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous|next/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /previous|next/i })).not.toBeInTheDocument();
    });
  });

  describe('logSequenceEvent', () => {
    const unitIds = ['unit-1', 'unit-2', 'unit-3'];

    it('reports the 1-indexed current and target tabs', () => {
      logSequenceEvent('edx.ui.lms.sequence.tab_selected', {
        sequence: { unitIds }, unitId: 'unit-2', widgetPlacement: 'top', targetUnitId: 'unit-3',
      });
      const payload = {
        current_tab: 2,
        id: 'unit-2',
        tab_count: 3,
        widget_placement: 'top',
        target_tab: 3,
      };
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', payload);
      expect(sendTrackingLogEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', payload);
    });

    it('reports tab 1 of 0 for a sequence with no units', () => {
      logSequenceEvent('edx.ui.lms.sequence.next_selected', {
        sequence: { unitIds: [] }, unitId: null, widgetPlacement: 'bottom',
      });
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.next_selected', {
        current_tab: 1,
        id: null,
        tab_count: 0,
        widget_placement: 'bottom',
      });
    });
  });
});

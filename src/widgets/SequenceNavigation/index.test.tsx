import { Factory } from 'rosie';
import { getAnalyticsService } from '@openedx/frontend-base';
import { breakpoints } from '@openedx/paragon';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import routes from '@src/routes';
import { mockCourseRequests, unitPath } from '@src/tests/courseware';
import { renderRoutes } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import { sequenceNavigationSlotOperation } from '.';

describe('sequenceNavigationSlotOperation', () => {
  const { sendTrackEvent } = getAnalyticsService();

  // The lazy routes' first load compiles the tab page and the container, which can outlast findBy's timeout.
  beforeAll(() => Promise.all([import('@src/Main'), import('@src/courseware')]));

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth!;
    global.scrollTo = jest.fn();
    addSlotOperations([sequenceNavigationSlotOperation]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // A sequence of three units, with the learner on the second.
  const renderMiddleUnit = () => {
    const courseMetadata = Factory.build('courseMetadata');
    const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
      'block',
      { type: 'vertical' },
      { courseId: courseMetadata.id },
    ));
    const fixtures = mockCourseRequests({ courseMetadata, unitBlocks });
    const { router } = renderRoutes(routes, unitPath(fixtures.courseId, fixtures.sequenceId, unitBlocks[1].id));
    return { ...fixtures, router };
  };

  const findTabStrip = () => screen.findByTestId('courseware-sequence-navigation');

  it('renders a button per unit, with the current one active', async () => {
    const { unitBlocks } = renderMiddleUnit();

    const tabStrip = await findTabStrip();
    const unitButtons = unitBlocks.map((block) => within(tabStrip).getByTitle(block.display_name));
    expect(unitButtons[1]).toHaveClass('active');
    expect(unitButtons[0]).not.toHaveClass('active');
  });

  it('goes to a unit when its button is clicked', async () => {
    const user = userEvent.setup();
    const {
      courseId, sequenceId, unitBlocks, router,
    } = renderMiddleUnit();

    await user.click(within(await findTabStrip()).getByTitle(unitBlocks[2].display_name));

    await waitFor(() => expect(router.state.location.pathname).toEqual(unitPath(courseId, sequenceId, unitBlocks[2].id)));
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', expect.objectContaining({
      current_tab: 2, target_tab: 3, widget_placement: 'top',
    }));
  });

  it('goes to the previous and the next unit', async () => {
    const user = userEvent.setup();
    const {
      courseId, sequenceId, unitBlocks, router,
    } = renderMiddleUnit();

    await user.click(within(await findTabStrip()).getByRole('link', { name: /previous/i }));
    await waitFor(() => expect(router.state.location.pathname).toEqual(unitPath(courseId, sequenceId, unitBlocks[0].id)));
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.previous_selected', expect.objectContaining({
      widget_placement: 'top',
    }));

    await user.click(within(await findTabStrip()).getByRole('link', { name: /next/i }));
    await waitFor(() => expect(router.state.location.pathname).toEqual(unitPath(courseId, sequenceId, unitBlocks[1].id)));
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.next_selected', expect.objectContaining({
      widget_placement: 'top',
    }));
  });
});

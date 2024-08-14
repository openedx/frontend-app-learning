import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { breakpoints } from '@openedx/paragon';
import {
  loadUnit, render, screen, fireEvent, waitFor, initializeTestStore, act,
} from '../../../setupTest';
import SidebarContext from '../sidebar/SidebarContext';
import Sequence from './Sequence';
import { fetchSequenceFailure } from '../../data/slice';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-lib-special-exams/dist/data/thunks.js', () => ({
  ...jest.requireActual('@edx/frontend-lib-special-exams/dist/data/thunks.js'),
  checkExamEntry: () => jest.fn(),
}));

describe('Sequence', () => {
  let mockData;
  let defaultContextValue;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
    'block',
    { type: 'vertical' },
    { courseId: courseMetadata.id },
  ));
  const enableNavigationSidebar = { enable_navigation_sidebar: false };

  beforeAll(async () => {
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    const { courseware } = store.getState();
    mockData = {
      unitId: unitBlocks[0].id,
      sequenceId: courseware.sequenceId,
      courseId: courseware.courseId,
      unitNavigationHandler: () => {},
      nextSequenceHandler: () => {},
      previousSequenceHandler: () => {},
      toggleNotificationTray: () => {},
      setNotificationStatus: () => {},
    };
    defaultContextValue = { courseId: mockData.courseId, currentSidebar: null, toggleSidebar: jest.fn() };
  });

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
  });

  const SidebarWrapper = ({ contextValue = defaultContextValue, overrideData = {} }) => (
    <SidebarContext.Provider value={contextValue}>
      <Sequence {...({ ...mockData, ...overrideData })} />
    </SidebarContext.Provider>
  );

  SidebarWrapper.defaultProps = {
    contextValue: defaultContextValue,
    overrideData: {},
  };

  SidebarWrapper.propTypes = {
    contextValue: PropTypes.shape({}),
    overrideData: PropTypes.shape({}),
  };

  it('renders correctly without data', async () => {
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    render(
      <Sequence {...mockData} {...{ unitId: undefined, sequenceId: undefined }} />,
      { store: testStore, wrapWithRouter: true },
    );

    expect(screen.getByText('There is no content here.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders correctly for gated content', async () => {
    const sequenceBlocks = [Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId: courseMetadata.id },
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
      { courseId: courseMetadata.id, unitBlocks, sequenceBlock: sequenceBlocks[0] },
    )];
    const testStore = await initializeTestStore({
      courseMetadata,
      unitBlocks,
      sequenceBlocks,
      sequenceMetadata,
      enableNavigationSidebar: { enable_navigation_sidebar: true },
    }, false);
    const { container } = render(
      <SidebarWrapper overrideData={{ sequenceId: sequenceBlocks[0].id }} />,
      { store: testStore, wrapWithRouter: true },
    );

    waitFor(() => {
      expect(screen.queryByText('Loading locked content messaging...')).toBeInTheDocument();
      // `Previous`, `Prerequisite` and `Close Tray` buttons.
      expect(screen.getAllByRole('button').length).toEqual(3);
      // `Next` button.
      expect(screen.getAllByRole('link').length).toEqual(1);

      expect(screen.getByText('Content Locked')).toBeInTheDocument();
      const unitContainer = container.querySelector('.unit-container');
      expect(unitContainer.querySelector('svg')).toHaveClass('fa-lock');
      expect(screen.getByText(/You must complete the prerequisite/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go To Prerequisite Section' })).toBeInTheDocument();
      expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
    });
  });

  it('renders correctly for hidden after due content', async () => {
    const sequenceBlocks = [Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId: courseMetadata.id },
    )];
    const sequenceMetadata = [Factory.build(
      'sequenceMetadata',
      { is_hidden_after_due: true },
      { courseId: courseMetadata.id, unitBlocks, sequenceBlock: sequenceBlocks[0] },
    )];
    const testStore = await initializeTestStore({
      courseMetadata, unitBlocks, sequenceBlocks, sequenceMetadata, enableNavigationSidebar,
    }, false);
    render(
      <Sequence {...mockData} {...{ sequenceId: sequenceBlocks[0].id }} />,
      { store: testStore, wrapWithRouter: true },
    );

    await waitFor(() => {
      expect(screen.queryByText('The due date for this assignment has passed.')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'progress page' }))
      .toHaveAttribute('href', 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/progress');

    // No normal content or navigation should be rendered. Just the above alert.
    expect(screen.queryAllByRole('button').length).toEqual(0);
    expect(screen.queryAllByRole('link').length).toEqual(1);
  });

  it('displays error message on sequence load failure', async () => {
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    testStore.dispatch(fetchSequenceFailure({ sequenceId: mockData.sequenceId }));
    render(<Sequence {...mockData} />, { store: testStore, wrapWithRouter: true });

    expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
  });

  it('handles loading unit', async () => {
    render(<SidebarWrapper />, { wrapWithRouter: true });
    waitFor(() => {
      expect(screen.findByText('Loading learning sequence...')).toBeInTheDocument();
      // `Previous`, `Prerequisite` and `Close Tray` buttons.
      expect(screen.getAllByRole('button')).toHaveLength(3);
      // Renders `Next` button.
      expect(screen.getAllByRole('link')).toHaveLength(1);

      loadUnit();
      expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
      // At this point there will be 2 `Previous` and 2 `Next` buttons.
      expect(screen.getAllByRole('button', { name: /previous/i }).length).toEqual(2);
      expect(screen.getAllByRole('link', { name: /next/i }).length).toEqual(2);
      // Renders two `Next` buttons for top and bottom unit navigations.
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });
  });

  describe('sequence and unit navigation buttons', () => {
    let testStore;
    const sequenceBlocks = [Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId: courseMetadata.id },
    ), Factory.build(
      'block',
      { type: 'sequential', children: unitBlocks.map(block => block.id) },
      { courseId: courseMetadata.id },
    )];

    beforeAll(async () => {
      testStore = await initializeTestStore({
        courseMetadata, unitBlocks, sequenceBlocks, enableNavigationSidebar,
      }, false);
    });

    beforeEach(() => {
      sendTrackEvent.mockClear();
    });

    it('navigates to the previous sequence if the unit is the first in the sequence', async () => {
      const testData = {
        ...mockData,
        sequenceId: sequenceBlocks[1].id,
        previousSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore, wrapWithRouter: true });
      waitFor(() => {
        expect(screen.findByText('Loading learning sequence...')).toBeInTheDocument();

        const sequencePreviousButton = screen.getByRole('link', { name: /previous/i });
        fireEvent.click(sequencePreviousButton);
        expect(testData.previousSequenceHandler).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.previous_selected', {
          current_tab: 1,
          id: testData.unitId,
          tab_count: unitBlocks.length,
          widget_placement: 'top',
        });

        loadUnit();
        expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
        const unitPreviousButton = screen.getAllByRole('link', { name: /previous/i })
          .filter(button => button !== sequencePreviousButton)[0];
        fireEvent.click(unitPreviousButton);
        expect(testData.previousSequenceHandler).toHaveBeenCalledTimes(2);
        expect(sendTrackEvent).toHaveBeenCalledTimes(2);
        expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.sequence.previous_selected', {
          current_tab: 1,
          id: testData.unitId,
          tab_count: unitBlocks.length,
          widget_placement: 'bottom',
        });
      });
    });

    it('navigates to the next sequence if the unit is the last in the sequence', async () => {
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitBlocks.length - 1].id,
        sequenceId: sequenceBlocks[0].id,
        nextSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore, wrapWithRouter: true });
      waitFor(() => {
        expect(screen.findByText('Loading learning sequence...')).toBeInTheDocument();
        const sequenceNextButton = screen.getByRole('link', { name: /next/i });
        fireEvent.click(sequenceNextButton);
        expect(testData.nextSequenceHandler).toHaveBeenCalledTimes(1);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.next_selected', {
          current_tab: unitBlocks.length,
          id: testData.unitId,
          tab_count: unitBlocks.length,
          widget_placement: 'top',
        });

        loadUnit();
        expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
        const unitNextButton = screen.getAllByRole('link', { name: /next/i })
          .filter(button => button !== sequenceNextButton)[0];
        fireEvent.click(unitNextButton);
        expect(testData.nextSequenceHandler).toHaveBeenCalledTimes(2);
        expect(sendTrackEvent).toHaveBeenCalledTimes(2);
        expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.sequence.next_selected', {
          current_tab: unitBlocks.length,
          id: testData.unitId,
          tab_count: unitBlocks.length,
          widget_placement: 'bottom',
        });
      });
    });

    it('navigates to the previous/next unit if the unit is not in the corner of the sequence', async () => {
      const unitNumber = 1;
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitNumber].id,
        sequenceId: sequenceBlocks[0].id,
        unitNavigationHandler: jest.fn(),
        previousSequenceHandler: jest.fn(),
        nextSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore, wrapWithRouter: true });
      waitFor(() => {
        expect(screen.findByText('Loading learning sequence...')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('link', { name: /previous/i }));
        expect(testData.previousSequenceHandler).not.toHaveBeenCalled();
        expect(testData.unitNavigationHandler).toHaveBeenCalledWith(unitBlocks[unitNumber - 1].id);

        fireEvent.click(screen.getByRole('link', { name: /next/i }));
        expect(testData.nextSequenceHandler).not.toHaveBeenCalled();
        // As `previousSequenceHandler` and `nextSequenceHandler` are mocked,
        // we aren't really changing the position here.
        // Therefore the next unit will still be `the initial one + 1`.
        expect(testData.unitNavigationHandler).toHaveBeenNthCalledWith(2, unitBlocks[unitNumber + 1].id);

        expect(sendTrackEvent).toHaveBeenCalledTimes(2);
      });
    });

    it('handles the `Previous` buttons for the first unit in the first sequence', async () => {
      const testData = {
        ...mockData,
        unitId: unitBlocks[0].id,
        sequenceId: sequenceBlocks[0].id,
        unitNavigationHandler: jest.fn(),
        previousSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore, wrapWithRouter: true });
      loadUnit();
      waitFor(() => {
        expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();

        screen.getAllByRole('button', { name: /previous/i }).forEach(button => fireEvent.click(button));

        expect(testData.previousSequenceHandler).not.toHaveBeenCalled();
        expect(testData.unitNavigationHandler).not.toHaveBeenCalled();
        expect(sendTrackEvent).not.toHaveBeenCalled();
      });
    });

    it('handles the `Next` buttons for the last unit in the last sequence', async () => {
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitBlocks.length - 1].id,
        sequenceId: sequenceBlocks[sequenceBlocks.length - 1].id,
        unitNavigationHandler: jest.fn(),
        nextSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore, wrapWithRouter: true });
      loadUnit();
      waitFor(() => {
        expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();

        screen.getAllByRole('button', { name: /next/i }).forEach(button => fireEvent.click(button));

        expect(testData.nextSequenceHandler).not.toHaveBeenCalled();
        expect(testData.unitNavigationHandler).not.toHaveBeenCalled();
        expect(sendTrackEvent).not.toHaveBeenCalled();
      });
    });

    it('handles the navigation buttons for empty sequence', async () => {
      const testSequenceBlocks = [Factory.build(
        'block',
        { type: 'sequential', children: unitBlocks.map(block => block.id) },
        { courseId: courseMetadata.id },
      ), Factory.build(
        'block',
        { type: 'sequential', children: [] },
        { courseId: courseMetadata.id },
      ), Factory.build(
        'block',
        { type: 'sequential', children: unitBlocks.map(block => block.id) },
        { courseId: courseMetadata.id },
      )];
      const testSequenceMetadata = testSequenceBlocks.map(block => Factory.build(
        'sequenceMetadata',
        {},
        { courseId: courseMetadata.id, unitBlocks: block.children.length ? unitBlocks : [], sequenceBlock: block },
      ));
      const innerTestStore = await initializeTestStore({
        courseMetadata,
        unitBlocks,
        sequenceBlocks: testSequenceBlocks,
        sequenceMetadata: testSequenceMetadata,
        enableNavigationSidebar,
      }, false);
      const testData = {
        ...mockData,
        unitId: unitBlocks[0].id,
        sequenceId: testSequenceBlocks[1].id,
        unitNavigationHandler: jest.fn(),
        previousSequenceHandler: jest.fn(),
        nextSequenceHandler: jest.fn(),
      };

      render(<SidebarWrapper overrideData={testData} />, { store: innerTestStore, wrapWithRouter: true });
      loadUnit();

      waitFor(() => {
        expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();

        screen.getAllByRole('link', { name: /previous/i }).forEach(button => fireEvent.click(button));
        expect(testData.previousSequenceHandler).toHaveBeenCalledTimes(2);
        expect(testData.unitNavigationHandler).toHaveBeenCalledTimes(2);

        screen.getAllByRole('link', { name: /next/i }).forEach(button => fireEvent.click(button));
        expect(testData.nextSequenceHandler).toHaveBeenCalledTimes(2);
        expect(testData.unitNavigationHandler).toHaveBeenCalledTimes(4);

        expect(sendTrackEvent).toHaveBeenNthCalledWith(1, 'edx.ui.lms.sequence.previous_selected', {
          current_tab: 1,
          id: testData.unitId,
          tab_count: 0,
          widget_placement: 'top',
        });
        expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.sequence.previous_selected', {
          current_tab: 1,
          id: testData.unitId,
          tab_count: 0,
          widget_placement: 'bottom',
        });
        expect(sendTrackEvent).toHaveBeenNthCalledWith(3, 'edx.ui.lms.sequence.next_selected', {
          current_tab: 1,
          id: testData.unitId,
          tab_count: 0,
          widget_placement: 'top',
        });
        expect(sendTrackEvent).toHaveBeenNthCalledWith(4, 'edx.ui.lms.sequence.next_selected', {
          current_tab: 1,
          id: testData.unitId,
          tab_count: 0,
          widget_placement: 'bottom',
        });
      });
    });

    it('handles unit navigation button', async () => {
      const currentTabNumber = 1;
      const targetUnitNumber = 2;
      const targetUnit = unitBlocks[targetUnitNumber - 1];
      const testData = {
        ...mockData,
        unitId: unitBlocks[currentTabNumber - 1].id,
        sequenceId: sequenceBlocks[0].id,
        unitNavigationHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore, wrapWithRouter: true });
      waitFor(() => {
        expect(screen.findByText('Loading learning sequence...')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('link', { name: targetUnit.display_name }));
        expect(testData.unitNavigationHandler).toHaveBeenCalledWith(targetUnit.id);
        expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', {
          current_tab: currentTabNumber,
          id: testData.unitId,
          target_tab: targetUnitNumber,
          tab_count: unitBlocks.length,
          widget_placement: 'top',
        });
      });
    });
  });

  describe('notification feature', () => {
    it('renders notification tray in sequence', async () => {
      render(<SidebarWrapper contextValue={{ courseId: mockData.courseId, currentSidebar: 'NOTIFICATIONS', toggleSidebar: () => null }} />, { wrapWithRouter: true });
      waitFor(async () => expect(await screen.findByText('Notifications')).toBeInTheDocument());
    });

    it('handles click on notification tray close button', async () => {
      const toggleNotificationTray = jest.fn();
      render(<SidebarWrapper contextValue={{ courseId: mockData.courseId, currentSidebar: 'NOTIFICATIONS', toggleSidebar: toggleNotificationTray }} />, { wrapWithRouter: true });
      act(async () => {
        const notificationCloseIconButton = await screen.findByRole('button', { name: /Close notification tray/i });
        fireEvent.click(notificationCloseIconButton);
        expect(toggleNotificationTray).toHaveBeenCalled();
      });
    });

    it('does not render notification tray in sequence by default if in responsive view', async () => {
      global.innerWidth = breakpoints.medium.maxWidth;
      const { container } = render(<Sequence {...mockData} />, { wrapWithRouter: true });
      // unable to test the absence of 'Notifications' by finding it by text, using the class of the tray instead:
      expect(container).not.toHaveClass('notification-tray-container');
    });
  });
});

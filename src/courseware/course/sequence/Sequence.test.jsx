import PropTypes from 'prop-types';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { breakpoints } from '@openedx/paragon';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import {
  loadUnit, render, screen, waitFor, getTestStoreIds, initializeTestStore,
} from '../../../setupTest';
import MountCourseQueryHooks from '../../../tests/MountCourseQueryHooks';
import { getEnabledWidgets } from '../sidebar/defaultWidgets';
import { SidebarProvider } from '../sidebar/SidebarContext';
import Sequence, { logSequenceEvent } from './Sequence';

jest.mock('@edx/frontend-platform/analytics');

describe('Sequence', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
    'block',
    { type: 'vertical' },
    { courseId: courseMetadata.id },
  ));

  beforeAll(async () => {
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    const { courseId, sequenceId } = getTestStoreIds(store);
    mockData = {
      unitId: unitBlocks[0].id,
      sequenceId,
      courseId,
      unitNavigationHandler: () => {},
      nextSequenceHandler: () => {},
      previousSequenceHandler: () => {},
    };
  });

  beforeEach(() => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
  });

  // Renders the sequence at its course route, as CoursewareContainer does: the navigation reads
  // `courseId` from the route params.
  const SidebarWrapper = ({ overrideData = {}, widgets = [] }) => {
    const data = { ...mockData, ...overrideData };
    return (
      <MemoryRouter initialEntries={[`/course/${data.courseId}/${data.sequenceId}/${data.unitId}`]}>
        <Routes>
          <Route
            path="/course/:courseId/:sequenceId/*"
            element={(
              <SidebarProvider courseId={data.courseId} unitId={data.unitId} widgets={widgets}>
                <MountCourseQueryHooks courseId={data.courseId} sequenceId={data.sequenceId} />
                <Sequence {...data} />
              </SidebarProvider>
            )}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  SidebarWrapper.defaultProps = {
    overrideData: {},
    widgets: [],
  };

  SidebarWrapper.propTypes = {
    overrideData: PropTypes.shape({}),
    widgets: PropTypes.arrayOf(PropTypes.shape({})),
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

  it('displays the no-content message for a unit that is not in the sequence', async () => {
    const testStore = await initializeTestStore({ courseMetadata, unitBlocks }, false);
    const { sequenceId } = getTestStoreIds(testStore);
    render(
      <SidebarWrapper overrideData={{ sequenceId, unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@not_in_this_sequence' }} />,
      { store: testStore },
    );

    expect(await screen.findByText('There is no content here.')).toBeInTheDocument();
    expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('content-iframe-test-id')).not.toBeInTheDocument();
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
    }, false);
    const { container } = render(
      <SidebarWrapper overrideData={{ sequenceId: sequenceBlocks[0].id }} />,
      { store: testStore },
    );

    await screen.findByText('Loading locked content messaging...');

    expect(await screen.findByText('Content Locked')).toBeInTheDocument();
    // `Prerequisite` and `Close Tray` buttons.
    expect(screen.getAllByRole('button')).toHaveLength(2);
    // No `Next` button.
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
      { courseId: courseMetadata.id },
    )];
    const sequenceMetadata = [Factory.build(
      'sequenceMetadata',
      { is_hidden_after_due: true },
      { courseId: courseMetadata.id, unitBlocks, sequenceBlock: sequenceBlocks[0] },
    )];
    const testStore = await initializeTestStore({
      courseMetadata, unitBlocks, sequenceBlocks, sequenceMetadata,
    }, false);
    render(
      <MemoryRouter initialEntries={[`/course/${mockData.courseId}/${sequenceBlocks[0].id}`]}>
        <Routes>
          <Route
            path="/course/:courseId/:sequenceId/*"
            element={(
              <>
                <MountCourseQueryHooks courseId={mockData.courseId} sequenceId={sequenceBlocks[0].id} />
                <Sequence {...mockData} {...{ sequenceId: sequenceBlocks[0].id }} />
              </>
            )}
          />
        </Routes>
      </MemoryRouter>,
      { store: testStore },
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
    const failingMock = new MockAdapter(getAuthenticatedHttpClient());
    failingMock.onGet(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${mockData.sequenceId}`).reply(500);
    render(
      <>
        <MountCourseQueryHooks courseId={mockData.courseId} sequenceId={mockData.sequenceId} />
        <Sequence {...mockData} />
      </>,
      { store: testStore, wrapWithRouter: true },
    );

    await screen.findByText('There was an error loading this course.');
    failingMock.restore();
  });

  it('handles loading unit', async () => {
    const testStore = await initializeTestStore({ courseMetadata, unitBlocks }, false);
    const { sequenceId } = getTestStoreIds(testStore);
    render(<SidebarWrapper overrideData={{ sequenceId }} />, { store: testStore });
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();
    // `Previous`, `Next`, `Bookmark` and `Close Tray` buttons.
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
        courseMetadata, unitBlocks, sequenceBlocks,
      }, false);
    });

    beforeEach(() => {
      sendTrackEvent.mockClear();
    });

    it('navigates to the previous sequence if the unit is the first in the sequence', async () => {
      const user = userEvent.setup();
      const testData = {
        ...mockData,
        sequenceId: sequenceBlocks[1].id,
        previousSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore });
      expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: /previous/i }));
      expect(testData.previousSequenceHandler).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.previous_selected', {
        current_tab: 1,
        id: testData.unitId,
        tab_count: unitBlocks.length,
        widget_placement: 'bottom',
      });

      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
      await user.click(screen.getByRole('link', { name: /previous/i }));
      expect(testData.previousSequenceHandler).toHaveBeenCalledTimes(2);
      expect(sendTrackEvent).toHaveBeenCalledTimes(2);
      expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.sequence.previous_selected', {
        current_tab: 1,
        id: testData.unitId,
        tab_count: unitBlocks.length,
        widget_placement: 'bottom',
      });
    });

    it('navigates to the next sequence if the unit is the last in the sequence', async () => {
      const user = userEvent.setup();
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitBlocks.length - 1].id,
        sequenceId: sequenceBlocks[0].id,
        nextSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore });
      expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: /next/i }));
      expect(testData.nextSequenceHandler).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.next_selected', {
        current_tab: unitBlocks.length,
        id: testData.unitId,
        tab_count: unitBlocks.length,
        widget_placement: 'bottom',
      });

      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
      await user.click(screen.getByRole('link', { name: /next/i }));
      expect(testData.nextSequenceHandler).toHaveBeenCalledTimes(2);
      expect(sendTrackEvent).toHaveBeenCalledTimes(2);
      expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.sequence.next_selected', {
        current_tab: unitBlocks.length,
        id: testData.unitId,
        tab_count: unitBlocks.length,
        widget_placement: 'bottom',
      });
    });

    it('navigates to the previous/next unit if the unit is not in the corner of the sequence', async () => {
      const user = userEvent.setup();
      const unitNumber = 1;
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitNumber].id,
        sequenceId: sequenceBlocks[0].id,
        unitNavigationHandler: jest.fn(),
        previousSequenceHandler: jest.fn(),
        nextSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore });
      expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: /previous/i }));
      expect(testData.previousSequenceHandler).not.toHaveBeenCalled();
      expect(testData.unitNavigationHandler).toHaveBeenCalledWith(unitBlocks[unitNumber - 1].id);

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(testData.nextSequenceHandler).not.toHaveBeenCalled();
      // As `previousSequenceHandler` and `nextSequenceHandler` are mocked,
      // we aren't really changing the position here.
      // Therefore the next unit will still be `the initial one + 1`.
      expect(testData.unitNavigationHandler).toHaveBeenNthCalledWith(2, unitBlocks[unitNumber + 1].id);

      expect(sendTrackEvent).toHaveBeenCalledTimes(2);
    });

    it('handles the `Previous` buttons for the first unit in the first sequence', async () => {
      const user = userEvent.setup();
      const testData = {
        ...mockData,
        unitId: unitBlocks[0].id,
        sequenceId: sequenceBlocks[0].id,
        unitNavigationHandler: jest.fn(),
        previousSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore });
      await screen.findByRole('button', { name: /previous/i });
      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

      await Promise.all(screen.getAllByRole('button', { name: /previous/i }).map(button => user.click(button)));

      expect(testData.previousSequenceHandler).not.toHaveBeenCalled();
      expect(testData.unitNavigationHandler).not.toHaveBeenCalled();
      expect(sendTrackEvent).not.toHaveBeenCalled();
    });

    it('handles the `Next` buttons for the last unit in the last sequence', async () => {
      const user = userEvent.setup();
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitBlocks.length - 1].id,
        sequenceId: sequenceBlocks[sequenceBlocks.length - 1].id,
        unitNavigationHandler: jest.fn(),
        nextSequenceHandler: jest.fn(),
      };
      render(<SidebarWrapper overrideData={testData} />, { store: testStore });
      await screen.findByRole('button', { name: /next/i });
      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

      await Promise.all(screen.getAllByRole('button', { name: /next/i }).map(button => user.click(button)));

      expect(testData.nextSequenceHandler).not.toHaveBeenCalled();
      expect(testData.unitNavigationHandler).not.toHaveBeenCalled();
      expect(sendTrackEvent).not.toHaveBeenCalled();
    });

    it('shows the no-content message for a sequence with no units', async () => {
      const testSequenceBlocks = [Factory.build(
        'block',
        { type: 'sequential', children: unitBlocks.map(block => block.id) },
        { courseId: courseMetadata.id },
      ), Factory.build(
        'block',
        { type: 'sequential', children: [] },
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
      }, false);
      const testData = {
        ...mockData,
        unitId: undefined,
        sequenceId: testSequenceBlocks[1].id,
      };

      render(<SidebarWrapper overrideData={testData} />, { store: innerTestStore });

      expect(await screen.findByText('There is no content here.')).toBeInTheDocument();
      expect(screen.queryByTestId('content-iframe-test-id')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous|next/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /previous|next/i })).not.toBeInTheDocument();
    });
  });

  describe('logSequenceEvent', () => {
    const unitIds = ['unit-1', 'unit-2', 'unit-3'];

    beforeEach(() => {
      sendTrackEvent.mockClear();
      sendTrackingLogEvent.mockClear();
    });

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

  describe('Upgrade Panel feature', () => {
    // The panel renders under the real sidebar provider, as the stored sidebar on a desktop viewport.
    const renderWithUpgradePanelOpen = async () => {
      global.innerWidth = breakpoints.extraExtraLarge.minWidth;
      window.localStorage.setItem(`sidebar.${mockData.courseId}`, JSON.stringify('UPGRADE'));
      const testStore = await initializeTestStore({ courseMetadata, unitBlocks }, false);
      const { sequenceId } = getTestStoreIds(testStore);
      render(
        <MemoryRouter initialEntries={[`/course/${mockData.courseId}/${sequenceId}/${mockData.unitId}`]}>
          <Routes>
            <Route
              path="/course/:courseId/:sequenceId/*"
              element={(
                <SidebarProvider courseId={mockData.courseId} unitId={mockData.unitId} widgets={getEnabledWidgets()}>
                  <MountCourseQueryHooks courseId={mockData.courseId} sequenceId={sequenceId} />
                  <Sequence {...mockData} sequenceId={sequenceId} />
                </SidebarProvider>
              )}
            />
          </Routes>
        </MemoryRouter>,
        { store: testStore },
      );
    };

    afterEach(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    it('renders upgrade panel in sequence', async () => {
      await renderWithUpgradePanelOpen();

      expect(await screen.findByRole('region', { name: /upgrade panel/i })).not.toHaveClass('d-none');
    });

    it('handles click on upgrade panel close button', async () => {
      const user = userEvent.setup();
      await renderWithUpgradePanelOpen();
      await screen.findByRole('region', { name: /upgrade panel/i });

      await user.click(screen.getByRole('button', { name: /Close sidebar/i }));

      expect(screen.queryByRole('region', { name: /upgrade panel/i })).not.toBeInTheDocument();
    });

    it('does not render upgrade panel in sequence by default if in responsive view', async () => {
      global.innerWidth = breakpoints.medium.maxWidth;
      const { container } = render(<Sequence {...mockData} />, { wrapWithRouter: true });
      // unable to test the absence of 'Upgrade' by finding it by text, using the class of the panel instead:
      expect(container).not.toHaveClass('upgrade-panel-container');
    });
  });
});

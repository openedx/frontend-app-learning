import React from 'react';
import { Factory } from 'rosie';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  loadUnit, render, screen, fireEvent, waitFor, initializeTestStore,
} from '../../../setupTest';
import Sequence from './Sequence';
import { fetchSequenceFailure } from '../../data/slice';

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
    const { courseware } = store.getState();
    mockData = {
      unitId: unitBlocks[0].id,
      sequenceId: courseware.sequenceId,
      courseId: courseware.courseId,
      unitNavigationHandler: () => {},
      nextSequenceHandler: () => {},
      previousSequenceHandler: () => {},
    };
  });

  it('renders correctly without data', async () => {
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    render(<Sequence {...mockData} {...{ unitId: undefined, sequenceId: undefined }} />, { store: testStore });

    expect(screen.getByText('There is no content here.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders correctly for gated content', async () => {
    const sequenceBlock = [Factory.build(
      'block',
      { type: 'sequential', children: [unitBlocks.map(block => block.id)] },
      { courseId: courseMetadata.id },
    )];
    const gatedContent = {
      gated: true,
      prereq_id: `${sequenceBlock[0].id}-prereq`,
      prereq_section_name: `${sequenceBlock[0].display_name}-prereq`,
      gated_section_name: sequenceBlock[0].display_name,
    };
    const sequenceMetadata = [Factory.build(
      'sequenceMetadata',
      { courseId: courseMetadata.id, gated_content: gatedContent },
      { unitBlocks, sequenceBlock: sequenceBlock[0] },
    )];
    const testStore = await initializeTestStore({ unitBlocks, sequenceBlock, sequenceMetadata }, false);
    const { container } = render(
      <Sequence {...mockData} {...{ sequenceId: sequenceBlock[0].id }} />,
      { store: testStore },
    );

    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();
    // Only `Previous`, `Next` and `Bookmark` buttons.
    expect(screen.getAllByRole('button').length).toEqual(3);

    expect(await screen.findByText('Content Locked')).toBeInTheDocument();
    const unitContainer = container.querySelector('.unit-container');
    expect(unitContainer.querySelector('svg')).toHaveClass('fa-lock');
    expect(screen.getByText(/You must complete the prerequisite/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go To Prerequisite Section' })).toBeInTheDocument();
    expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
  });

  it('displays error message on sequence load failure', async () => {
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    testStore.dispatch(fetchSequenceFailure({ sequenceId: mockData.sequenceId }));
    render(<Sequence {...mockData} />, { store: testStore });

    expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
  });

  it('handles loading unit', async () => {
    render(<Sequence {...mockData} />);
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
    // Renders navigation buttons plus one button for each unit.
    expect(screen.getAllByRole('button')).toHaveLength(3 + unitBlocks.length);

    loadUnit();
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    // At this point there will be 2 `Previous` and 2 `Next` buttons.
    expect(screen.getAllByRole('button', { name: /previous|next/i }).length).toEqual(4);
  });

  describe('sequence and unit navigation buttons', () => {
    let testStore;
    const sequenceBlock = [Factory.build(
      'block',
      { type: 'sequential', children: [unitBlocks.map(block => block.id)] },
      { courseId: courseMetadata.id },
    ), Factory.build(
      'block',
      { type: 'sequential', children: [unitBlocks.map(block => block.id)] },
      { courseId: courseMetadata.id },
    )];

    beforeAll(async () => {
      testStore = await initializeTestStore({ courseMetadata, unitBlocks, sequenceBlock }, false);
    });

    beforeEach(() => {
      sendTrackEvent.mockClear();
    });

    it('navigates to the previous sequence if the unit is the first in the sequence', async () => {
      const testData = {
        ...mockData,
        sequenceId: sequenceBlock[1].id,
        previousSequenceHandler: jest.fn(),
      };
      render(<Sequence {...testData} />, { store: testStore });

      const sequencePreviousButton = screen.getByRole('button', { name: /previous/i });
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
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
      const unitPreviousButton = screen.getAllByRole('button', { name: /previous/i })
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

    it('navigates to the next sequence if the unit is the last in the sequence', async () => {
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitBlocks.length - 1].id,
        sequenceId: sequenceBlock[0].id,
        nextSequenceHandler: jest.fn(),
      };
      render(<Sequence {...testData} />, { store: testStore });

      const sequenceNextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(sequenceNextButton);
      expect(testData.nextSequenceHandler).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.next_selected', {
        current_tab: unitBlocks.length,
        id: testData.unitId,
        tab_count: unitBlocks.length,
        widget_placement: 'top',
      });

      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
      const unitNextButton = screen.getAllByRole('button', { name: /next/i })
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

    it('navigates to the previous/next unit if the unit is not in the corner of the sequence', () => {
      const unitNumber = 1;
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitNumber].id,
        sequenceId: sequenceBlock[0].id,
        unitNavigationHandler: jest.fn(),
        previousSequenceHandler: jest.fn(),
        nextSequenceHandler: jest.fn(),
      };
      render(<Sequence {...testData} />, { store: testStore });

      fireEvent.click(screen.getByRole('button', { name: /previous/i }));
      expect(testData.previousSequenceHandler).not.toHaveBeenCalled();
      expect(testData.unitNavigationHandler).toHaveBeenCalledWith(unitBlocks[unitNumber - 1].id);

      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(testData.nextSequenceHandler).not.toHaveBeenCalled();
      // As `previousSequenceHandler` and `nextSequenceHandler` are mocked, we aren't really changing the position here.
      // Therefore the next unit will still be `the initial one + 1`.
      expect(testData.unitNavigationHandler).toHaveBeenNthCalledWith(2, unitBlocks[unitNumber + 1].id);

      expect(sendTrackEvent).toHaveBeenCalledTimes(2);
    });

    it('handles the `Previous` buttons for the first unit in the first sequence', async () => {
      const testData = {
        ...mockData,
        unitId: unitBlocks[0].id,
        sequenceId: sequenceBlock[0].id,
        unitNavigationHandler: jest.fn(),
        previousSequenceHandler: jest.fn(),
      };
      render(<Sequence {...testData} />, { store: testStore });
      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

      screen.getAllByRole('button', { name: /previous/i }).forEach(button => fireEvent.click(button));

      expect(testData.previousSequenceHandler).not.toHaveBeenCalled();
      expect(testData.unitNavigationHandler).not.toHaveBeenCalled();
      expect(sendTrackEvent).not.toHaveBeenCalled();
    });

    it('handles the `Next` buttons for the last unit in the last sequence', async () => {
      const testData = {
        ...mockData,
        unitId: unitBlocks[unitBlocks.length - 1].id,
        sequenceId: sequenceBlock[sequenceBlock.length - 1].id,
        unitNavigationHandler: jest.fn(),
        nextSequenceHandler: jest.fn(),
      };
      render(<Sequence {...testData} />, { store: testStore });
      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

      screen.getAllByRole('button', { name: /next/i }).forEach(button => fireEvent.click(button));

      expect(testData.nextSequenceHandler).not.toHaveBeenCalled();
      expect(testData.unitNavigationHandler).not.toHaveBeenCalled();
      expect(sendTrackEvent).not.toHaveBeenCalled();
    });

    it('handles the navigation buttons for empty sequence', async () => {
      const testSequenceBlock = [Factory.build(
        'block',
        { type: 'sequential', children: [unitBlocks.map(block => block.id)] },
        { courseId: courseMetadata.id },
      ), Factory.build(
        'block',
        { type: 'sequential', children: [] },
        { courseId: courseMetadata.id },
      ), Factory.build(
        'block',
        { type: 'sequential', children: [unitBlocks.map(block => block.id)] },
        { courseId: courseMetadata.id },
      )];
      const testSequenceMetadata = testSequenceBlock.map(block => Factory.build(
        'sequenceMetadata',
        { courseId: courseMetadata.id },
        { unitBlocks: block.children.length ? unitBlocks : [], sequenceBlock: block },
      ));
      const innerTestStore = await initializeTestStore({
        courseMetadata, unitBlocks, sequenceBlock: testSequenceBlock, sequenceMetadata: testSequenceMetadata,
      }, false);
      const testData = {
        ...mockData,
        unitId: unitBlocks[0].id,
        sequenceId: testSequenceBlock[1].id,
        unitNavigationHandler: jest.fn(),
        previousSequenceHandler: jest.fn(),
        nextSequenceHandler: jest.fn(),
      };

      render(<Sequence {...testData} />, { store: innerTestStore });
      loadUnit();
      await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

      screen.getAllByRole('button', { name: /previous/i }).forEach(button => fireEvent.click(button));
      expect(testData.previousSequenceHandler).toHaveBeenCalledTimes(2);
      expect(testData.unitNavigationHandler).not.toHaveBeenCalled();

      screen.getAllByRole('button', { name: /next/i }).forEach(button => fireEvent.click(button));
      expect(testData.nextSequenceHandler).toHaveBeenCalledTimes(2);
      expect(testData.unitNavigationHandler).not.toHaveBeenCalled();

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

    it('handles unit navigation button', () => {
      const currentTabNumber = 1;
      const targetUnitNumber = 2;
      const targetUnit = unitBlocks[targetUnitNumber - 1];
      const testData = {
        ...mockData,
        unitId: unitBlocks[currentTabNumber - 1].id,
        sequenceId: sequenceBlock[0].id,
        unitNavigationHandler: jest.fn(),
      };
      render(<Sequence {...testData} />, { store: testStore });

      fireEvent.click(screen.getByRole('button', { name: targetUnit.display_name }));
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

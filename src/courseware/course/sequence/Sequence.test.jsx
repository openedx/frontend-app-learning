import React from 'react';
import { fireEvent, waitFor } from '@testing-library/dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { cloneDeep } from 'lodash';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  initialState,
  messageEvent, render, screen, testUnits,
} from '../../../setupTest';
import Sequence from './Sequence';

jest.mock('@edx/frontend-platform/analytics');

describe('Sequence', () => {
  const mockData = {
    unitId: '3',
    sequenceId: '1',
    courseId: '1',
    unitNavigationHandler: () => {},
    nextSequenceHandler: () => {},
    previousSequenceHandler: () => {},
    intl: {},
  };

  it('renders correctly without data', () => {
    const { asFragment } = render(
      <Sequence {...mockData} {...{ unitId: undefined, sequenceId: undefined }} />, { initialState: {} },
    );
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly for gated content', async () => {
    const { asFragment } = render(<Sequence {...mockData} {...{ sequenceId: '3' }} />);
    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();
    // Only `Previous`, `Next` and `Bookmark` buttons.
    expect(screen.getAllByRole('button').length).toEqual(3);

    const beforeLoadingUnit = asFragment();
    expect(beforeLoadingUnit).toMatchSnapshot();

    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(screen.getByText(/You must complete the prerequisite/)).toBeInTheDocument());
    expect(beforeLoadingUnit).toMatchDiffSnapshot(asFragment());
  });

  it('displays error message on sequence load failure', () => {
    const testState = cloneDeep(initialState);
    testState.courseware.sequenceStatus = 'failed';
    const { asFragment } = render(<Sequence {...mockData} />, { initialState: testState });

    expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('handles loading unit', async () => {
    const { asFragment } = render(<Sequence {...mockData} />);
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
    // Renders navigation buttons plus one button for each unit.
    expect(screen.getAllByRole('button').length).toEqual(3 + testUnits.length);

    const beforeLoadingUnit = asFragment();
    expect(beforeLoadingUnit).toMatchSnapshot();

    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    // At this point there will be 2 `Previous` and 2 `Next` buttons.
    expect(screen.getAllByRole('button', { name: /previous|next/i }).length).toEqual(4);
    expect(beforeLoadingUnit).toMatchDiffSnapshot(asFragment());
  });

  it('navigates to the previous sequence if the unit is the first in the sequence', async () => {
    sendTrackEvent.mockClear();
    const unitId = '1';
    const sequenceId = '2';
    const previousSequenceHandler = jest.fn();
    render(<Sequence {...mockData} {...{ unitId, sequenceId, previousSequenceHandler }} />);

    const sequencePreviousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(sequencePreviousButton);
    expect(previousSequenceHandler).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.previous_selected', {
      current_tab: Number(unitId), id: unitId, tab_count: testUnits.length, widget_placement: 'top',
    });

    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    const unitPreviousButton = screen.getAllByRole('button', { name: /previous/i })
      .filter(button => button !== sequencePreviousButton)[0];
    fireEvent.click(unitPreviousButton);
    expect(previousSequenceHandler).toHaveBeenCalledTimes(2);
    expect(sendTrackEvent).toHaveBeenCalledTimes(2);
    expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.sequence.previous_selected', {
      current_tab: Number(unitId), id: unitId, tab_count: testUnits.length, widget_placement: 'bottom',
    });
  });

  it('navigates to the next sequence if the unit is the last in the sequence', async () => {
    sendTrackEvent.mockClear();
    const unitId = String(testUnits.length);
    const sequenceId = '1';
    const nextSequenceHandler = jest.fn();
    render(<Sequence {...mockData} {...{ unitId, sequenceId, nextSequenceHandler }} />);

    const sequenceNextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(sequenceNextButton);
    expect(nextSequenceHandler).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.next_selected', {
      current_tab: Number(unitId), id: unitId, tab_count: testUnits.length, widget_placement: 'top',
    });

    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
    const unitNextButton = screen.getAllByRole('button', { name: /next/i })
      .filter(button => button !== sequenceNextButton)[0];
    fireEvent.click(unitNextButton);
    expect(nextSequenceHandler).toHaveBeenCalledTimes(2);
    expect(sendTrackEvent).toHaveBeenCalledTimes(2);
    expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.sequence.next_selected', {
      current_tab: Number(unitId), id: unitId, tab_count: testUnits.length, widget_placement: 'bottom',
    });
  });

  it('navigates to the previous/next unit if the unit is not in the corner of the sequence', () => {
    sendTrackEvent.mockClear();
    const unitNavigationHandler = jest.fn();
    const previousSequenceHandler = jest.fn();
    const nextSequenceHandler = jest.fn();
    render(<Sequence {...mockData} {...{ unitNavigationHandler, previousSequenceHandler, nextSequenceHandler }} />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(previousSequenceHandler).not.toHaveBeenCalled();
    expect(unitNavigationHandler).toHaveBeenCalledWith(String(Number(mockData.unitId) - 1));

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(nextSequenceHandler).not.toHaveBeenCalled();
    expect(unitNavigationHandler).toHaveBeenNthCalledWith(2, String(Number(mockData.unitId) + 1));

    expect(sendTrackEvent).toHaveBeenCalledTimes(2);
  });

  it('handles the `Previous` buttons for the first unit in the first sequence', async () => {
    sendTrackEvent.mockClear();
    const unitNavigationHandler = jest.fn();
    const previousSequenceHandler = jest.fn();
    const unitId = '1';
    render(<Sequence
      {...mockData}
      {...{
        unitNavigationHandler, previousSequenceHandler, unitId,
      }}
    />);
    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

    screen.getAllByRole('button', { name: /previous/i }).forEach(button => fireEvent.click(button));

    expect(previousSequenceHandler).not.toHaveBeenCalled();
    expect(unitNavigationHandler).not.toHaveBeenCalled();
    expect(sendTrackEvent).not.toHaveBeenCalled();
  });

  it('handles the `Next` buttons for the last unit in the last sequence', async () => {
    sendTrackEvent.mockClear();
    const unitNavigationHandler = jest.fn();
    const nextSequenceHandler = jest.fn();
    const unitId = String(testUnits.length);
    const sequenceId = String(Object.keys(initialState.models.sequences).length);
    render(<Sequence
      {...mockData}
      {...{
        unitNavigationHandler, nextSequenceHandler, unitId, sequenceId,
      }}
    />);
    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

    screen.getAllByRole('button', { name: /next/i }).forEach(button => fireEvent.click(button));

    expect(nextSequenceHandler).toHaveBeenCalledTimes(1);
    expect(unitNavigationHandler).not.toHaveBeenCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.next_selected', {
      current_tab: Number(unitId), id: unitId, tab_count: testUnits.length, widget_placement: 'top',
    });
  });

  it('handles the navigation buttons for empty sequence', async () => {
    sendTrackEvent.mockClear();
    const testState = cloneDeep(initialState);
    testState.models.sequences['1'].unitIds = [];

    const unitNavigationHandler = jest.fn();
    const previousSequenceHandler = jest.fn();
    const nextSequenceHandler = jest.fn();
    render(<Sequence
      {...mockData}
      {...{
        unitNavigationHandler, previousSequenceHandler, nextSequenceHandler,
      }}
    />, { initialState: testState });
    window.postMessage(messageEvent, '*');
    await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());

    screen.getAllByRole('button', { name: /previous/i }).forEach(button => fireEvent.click(button));
    expect(previousSequenceHandler).toHaveBeenCalledTimes(2);
    expect(unitNavigationHandler).not.toHaveBeenCalled();

    screen.getAllByRole('button', { name: /next/i }).forEach(button => fireEvent.click(button));
    expect(nextSequenceHandler).toHaveBeenCalledTimes(2);
    expect(unitNavigationHandler).not.toHaveBeenCalled();

    expect(sendTrackEvent).toHaveBeenNthCalledWith(1, 'edx.ui.lms.sequence.previous_selected', {
      current_tab: 1, id: mockData.unitId, tab_count: 0, widget_placement: 'top',
    });
    expect(sendTrackEvent).toHaveBeenNthCalledWith(2, 'edx.ui.lms.sequence.previous_selected', {
      current_tab: 1, id: mockData.unitId, tab_count: 0, widget_placement: 'bottom',
    });
    expect(sendTrackEvent).toHaveBeenNthCalledWith(3, 'edx.ui.lms.sequence.next_selected', {
      current_tab: 1, id: mockData.unitId, tab_count: 0, widget_placement: 'top',
    });
    expect(sendTrackEvent).toHaveBeenNthCalledWith(4, 'edx.ui.lms.sequence.next_selected', {
      current_tab: 1, id: mockData.unitId, tab_count: 0, widget_placement: 'bottom',
    });
  });

  it('handles unit navigation button', () => {
    sendTrackEvent.mockClear();
    const unitNavigationHandler = jest.fn();
    const targetUnit = '4';
    render(<Sequence {...mockData} {...{ unitNavigationHandler }} />);

    fireEvent.click(screen.getByRole('button', { name: targetUnit }));
    expect(unitNavigationHandler).toHaveBeenCalledWith(targetUnit);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.sequence.tab_selected', {
      current_tab: Number(mockData.unitId), id: mockData.unitId, target_tab: Number(targetUnit), tab_count: testUnits.length, widget_placement: 'top',
    });
  });
});

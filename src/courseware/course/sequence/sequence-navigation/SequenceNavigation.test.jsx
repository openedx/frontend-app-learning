import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { cloneDeep } from 'lodash';
import { fireEvent, getByText } from '@testing-library/dom';
import {
  initialState, render, screen, testUnits,
} from '../../../../setupTest';
import SequenceNavigation from './SequenceNavigation';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';

// Mock the hook to avoid relying on its implementation and mocking `getBoundingClientRect`.
jest.mock('../../../../generic/tabs/useIndexOfLastVisibleChild');
useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);

describe('Sequence Navigation', () => {
  const mockData = {
    previousSequenceHandler: () => {},
    onNavigate: () => {},
    nextSequenceHandler: () => {},
    sequenceId: '1',
    unitId: '3',
  };

  it('is empty while loading', () => {
    // Clone initialState.
    const testState = cloneDeep(initialState);
    testState.courseware.sequenceStatus = 'loading';

    const { container } = render(
      <SequenceNavigation {...mockData} />,
      { initialState: testState },
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders empty div without unitId', () => {
    const { container } = render(<SequenceNavigation {...mockData} unitId={undefined} />, { initialState });
    expect(getByText(container, (content, element) => (
      element.tagName.toLowerCase() === 'div' && element.getAttribute('style')))).toBeEmptyDOMElement();
  });

  it('renders locked button for gated content', () => {
    const testState = cloneDeep(initialState);
    testState.models.sequences['1'].gatedContent = { gated: true };
    const onNavigate = jest.fn();
    render(<SequenceNavigation {...mockData} {...{ onNavigate }} />, { initialState: testState });

    const unitButton = screen.getByTitle(mockData.unitId);
    fireEvent.click(unitButton);
    // The unit button should not work for gated content.
    expect(onNavigate).not.toHaveBeenCalled();
    // TODO: Not sure if this is working as expected, because the `contentType="lock"` will be overridden by the value
    //  from Redux. To make this provide a `fa-icon` lock we could introduce something like `overriddenContentType`.
    expect(unitButton.firstChild).toHaveClass('fa-book');
  });

  it('renders correctly and handles unit button clicks', () => {
    const onNavigate = jest.fn();
    render(<SequenceNavigation {...mockData} {...{ onNavigate }} />, { initialState });

    const unitButtons = screen.getAllByRole('button', { name: /\d+/ });
    expect(unitButtons).toHaveLength(testUnits.length);
    unitButtons.forEach(button => fireEvent.click(button));
    expect(onNavigate).toHaveBeenCalledTimes(unitButtons.length);
  });

  it('has both navigation buttons enabled for a non-corner unit of the sequence', () => {
    render(<SequenceNavigation {...mockData} />, { initialState });

    screen.getAllByRole('button', { name: /previous|next/i }).forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  it('has the "Previous" button disabled for the first unit of the sequence', () => {
    render(<SequenceNavigation {...mockData} unitId="1" />, { initialState });

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('has the "Next" button disabled for the last unit of the sequence', () => {
    render(<SequenceNavigation
      {...mockData}
      sequenceId="2"
      unitId={testUnits.length.toString()}
    />, { initialState });

    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('handles "Previous" and "Next" click', () => {
    const previousSequenceHandler = jest.fn();
    const nextSequenceHandler = jest.fn();
    render(<SequenceNavigation
      {...mockData}
      {...{ previousSequenceHandler, nextSequenceHandler }}
    />, { initialState });

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(previousSequenceHandler).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(nextSequenceHandler).toHaveBeenCalledTimes(1);
  });
});

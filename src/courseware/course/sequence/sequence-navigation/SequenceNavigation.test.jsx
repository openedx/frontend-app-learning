import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { cloneDeep } from 'lodash';
import { fireEvent } from '@testing-library/dom';
import { render, screen } from '../../../../test/test-utils';
import SequenceNavigation from './SequenceNavigation';
import useIndexOfLastVisibleChild from '../../../../tabs/useIndexOfLastVisibleChild';

// Mock the hook to avoid relying on its implementation and mocking `getBoundingClientRect`.
jest.mock('../../../../tabs/useIndexOfLastVisibleChild');
useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);

describe('Sequence Navigation', () => {
  const testUnits = [...Array(10).keys()].map(i => String(i + 1));
  const initialState = {
    courseware: {
      sequenceStatus: 'loaded',
      courseStatus: 'loaded',
      courseId: '1',
    },
    models: {
      courses: {
        1: {
          sectionIds: ['1'],
        },
      },
      sections: {
        1: {
          sequenceIds: ['1', '2'],
        },
      },
      sequences: {
        1: {
          unitIds: testUnits,
          showCompletion: true,
        },
        2: {
          unitIds: testUnits,
          showCompletion: true,
        },
      },
      units: testUnits.reduce(
        (acc, unitId) => Object.assign(acc, {
          [unitId]: {
            contentType: 'other',
            title: unitId,
          },
        }),
        {},
      ),
    },
  };

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

    const { asFragment } = render(
      <SequenceNavigation {...mockData} />,
      { initialState: testState },
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders empty div without unitId', () => {
    const { asFragment } = render(<SequenceNavigation {...mockData} unitId={undefined} />, { initialState });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders locked button for gated content', () => {
    // TODO: Not sure if this is working as expected, because the `contentType="lock"` will be overridden by the value
    //  from Redux. To make this provide a `fa-icon` lock we could introduce something like `overriddenContentType`.
    const testState = cloneDeep(initialState);
    testState.models.sequences['1'].gatedContent = { gated: true };

    const { asFragment } = render(
      <SequenceNavigation {...mockData} />,
      { initialState: testState },
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly', () => {
    const { asFragment } = render(<SequenceNavigation {...mockData} />, { initialState });
    expect(asFragment()).toMatchSnapshot();
  });

  it('has both navigation buttons enabled for a non-corner unit of the sequence', () => {
    render(<SequenceNavigation
      {...mockData}
    />, { initialState });

    screen.getAllByRole('button', { name: /previous|next/i }).forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  it('has the "Previous" button disabled for the first unit of the sequence', () => {
    render(<SequenceNavigation
      {...mockData}
      unitId="1"
    />, { initialState });

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

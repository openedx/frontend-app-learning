import React from 'react';
import { render, screen } from '../../../../test/test-utils';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import useIndexOfLastVisibleChild from '../../../../tabs/useIndexOfLastVisibleChild';

// Mock the hook to avoid relying on its implementation and mocking `getBoundingClientRect`.
jest.mock('../../../../tabs/useIndexOfLastVisibleChild');

describe('Sequence Navigation Tabs', () => {
  const testUnits = [...Array(10).keys()].map(i => String(i + 1));

  const initialState = {
    models: {
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
    unitId: '1',
    onNavigate: () => {
    },
    showCompletion: false,
    unitIds: testUnits,
  };

  it('renders correctly without dropdown', () => {
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);
    const { asFragment } = render(<SequenceNavigationTabs {...mockData} />, { initialState });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with dropdown', () => {
    useIndexOfLastVisibleChild.mockReturnValue([-1, null, null]);
    const { asFragment } = render(<SequenceNavigationTabs {...mockData} />, { initialState });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders unit buttons', () => {
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);
    render(<SequenceNavigationTabs {...mockData} />, { initialState });
    expect(screen.getAllByRole('button').length).toEqual(testUnits.length);
  });

  it('renders unit buttons and dropdown button', () => {
    useIndexOfLastVisibleChild.mockReturnValue([-1, null, null]);
    render(<SequenceNavigationTabs {...mockData} />, { initialState });
    expect(screen.getAllByRole('button').length).toEqual(testUnits.length + 1);
  });
});

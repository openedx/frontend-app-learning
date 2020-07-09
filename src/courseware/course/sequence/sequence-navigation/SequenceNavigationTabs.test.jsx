import React from 'react';
import {
  initialState, render, screen, testUnits,
} from '../../../../setupTest';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';

// Mock the hook to avoid relying on its implementation and mocking `getBoundingClientRect`.
jest.mock('../../../../generic/tabs/useIndexOfLastVisibleChild');

describe('Sequence Navigation Tabs', () => {
  const mockData = {
    unitId: '2',
    onNavigate: () => {
    },
    showCompletion: false,
    unitIds: testUnits,
  };

  it('renders unit buttons', () => {
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);
    render(<SequenceNavigationTabs {...mockData} />, { initialState });

    expect(screen.getAllByRole('button').length).toEqual(testUnits.length);
  });

  it('renders unit buttons and dropdown button', () => {
    useIndexOfLastVisibleChild.mockReturnValue([-1, null, null]);
    render(<SequenceNavigationTabs {...mockData} />, { initialState });

    expect(screen.getByRole('button', { name: `${mockData.unitId} of ${testUnits.length}` }))
      .toHaveClass('dropdown-button');
    expect(screen.getAllByRole('button').length).toEqual(testUnits.length + 1);
  });
});

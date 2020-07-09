import React from 'react';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import {
  initialState, render, screen, testUnits, fireEvent,
} from '../../../../setupTest';

describe('Sequence Navigation Dropdown', () => {
  const mockData = {
    unitId: '1',
    onNavigate: () => {},
    showCompletion: false,
    unitIds: testUnits,
  };

  it('renders correctly without units', () => {
    render(<SequenceNavigationDropdown {...mockData} unitIds={[]} />);
    expect(screen.getByRole('button')).toHaveTextContent('0 of 0');
  });

  testUnits.forEach(unitId => {
    it(`displays proper text for unit ${unitId} on mobile`, () => {
      render(<SequenceNavigationDropdown {...mockData} unitId={unitId} />, { initialState });
      expect(screen.getByRole('button')).toHaveTextContent(`${unitId} of ${testUnits.length}`);
    });
  });

  testUnits.forEach(unitId => {
    it(`marks unit ${unitId} as active`, () => {
      render(<SequenceNavigationDropdown {...mockData} unitId={unitId} />, { initialState });

      // Only the current unit should be marked as active.
      screen.getAllByText(/^\d$/).forEach(element => {
        if (element.textContent === unitId) {
          expect(element.parentElement).toHaveClass('active');
        } else {
          expect(element.parentElement).not.toHaveClass('active');
        }
      });
    });
  });

  it('handles the clicks', () => {
    const onNavigate = jest.fn();
    render(<SequenceNavigationDropdown {...mockData} onNavigate={onNavigate} />, { initialState });

    screen.getAllByText(/^\d+$/).forEach(element => fireEvent.click(element));
    expect(onNavigate).toHaveBeenCalledTimes(testUnits.length);
    testUnits.forEach(unit => {
      expect(onNavigate).toHaveBeenNthCalledWith(Number(unit), unit);
    });
  });
});

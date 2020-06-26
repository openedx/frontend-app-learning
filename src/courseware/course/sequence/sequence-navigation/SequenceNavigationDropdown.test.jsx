import React from 'react';
import { fireEvent } from '@testing-library/dom';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import { render, screen } from '../../../../test/test-utils';

describe('Sequence Navigation Dropdown', () => {
  const testUnits = ['1', '2', '3'];

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
    onNavigate: () => {},
    showCompletion: false,
    unitIds: testUnits,
  };

  it('renders correctly without units', () => {
    const { asFragment } = render(<SequenceNavigationDropdown
      {...mockData}
      unitIds={[]}
    />);

    expect(asFragment()).toMatchSnapshot();
  });

  testUnits.forEach(unitId => {
    it(`displays proper text for unit ${unitId} on mobile`, () => {
      render(<SequenceNavigationDropdown
        {...mockData}
        unitId={unitId}
      />, { initialState });

      expect(screen.getByRole('button')).toHaveTextContent(`${unitId} of ${testUnits.length}`);
    });
  });

  testUnits.forEach(unitId => {
    it(`marks unit ${unitId} as active`, () => {
      render(<SequenceNavigationDropdown
        {...mockData}
        unitId={unitId}
      />, { initialState });

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

    render(<SequenceNavigationDropdown
      {...mockData}
      onNavigate={onNavigate}
    />, { initialState });

    screen.getAllByText(/^\d$/).forEach(element => fireEvent.click(element));
    expect(onNavigate).toHaveBeenCalledTimes(testUnits.length);
  });
});

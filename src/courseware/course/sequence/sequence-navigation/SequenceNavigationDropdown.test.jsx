import React from 'react';
import { Factory } from 'rosie';
import { getAllByRole } from '@testing-library/dom';
import { act } from '@testing-library/react';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import {
  render, screen, fireEvent, initializeTestStore,
} from '../../../../setupTest';

describe('Sequence Navigation Dropdown', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
    'block',
    { type: 'vertical' },
    { courseId: courseMetadata.id },
  ));

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, unitBlocks });
    mockData = {
      unitId: unitBlocks[1].id,
      unitIds: unitBlocks.map(block => block.id),
      showCompletion: false,
      onNavigate: () => {},
    };
  });

  it('renders correctly without units', () => {
    render(<SequenceNavigationDropdown {...mockData} unitIds={[]} />);
    expect(screen.getByRole('button')).toHaveTextContent('0 of 0');
  });

  unitBlocks.forEach((unit, index) => {
    it(`displays proper text for unit ${index + 1} on mobile`, () => {
      render(<SequenceNavigationDropdown {...mockData} unitId={unit.id} />);
      expect(screen.getByRole('button')).toHaveTextContent(`${index + 1} of ${unitBlocks.length}`);
    });
  });

  unitBlocks.forEach((unit, index) => {
    it(`marks unit ${index + 1} as active`, async () => {
      const { container } = render(<SequenceNavigationDropdown {...mockData} unitId={unit.id} />);
      const dropdownToggle = container.querySelector('.dropdown-toggle');
      await act(async () => {
        await fireEvent.click(dropdownToggle);
      });
      const dropdownMenu = container.querySelector('.dropdown-menu');
      // Only the current unit should be marked as active.
      getAllByRole(dropdownMenu, 'button', { hidden: true }).forEach(button => {
        if (button.textContent === unit.display_name) {
          expect(button).toHaveClass('active');
        } else {
          expect(button).not.toHaveClass('active');
        }
      });
    });
  });

  it('handles the clicks', () => {
    const onNavigate = jest.fn();
    const { container } = render(<SequenceNavigationDropdown {...mockData} onNavigate={onNavigate} />);

    const dropdownToggle = container.querySelector('.dropdown-toggle');
    act(() => {
      fireEvent.click(dropdownToggle);
    });
    const dropdownMenu = container.querySelector('.dropdown-menu');
    getAllByRole(dropdownMenu, 'button', { hidden: true }).forEach(button => fireEvent.click(button));
    expect(onNavigate).toHaveBeenCalledTimes(unitBlocks.length);
    unitBlocks.forEach((unit, index) => {
      expect(onNavigate).toHaveBeenNthCalledWith(index + 1, unit.id);
    });
  });
});

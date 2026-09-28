import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';
import { getAllByRole } from '@testing-library/dom';
import { act } from '@testing-library/react';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import {
  render, screen, fireEvent, getTestStoreIds, initializeTestStore,
} from '../../../../setupTest';
import MountCourseQueryHooks from '../../../../tests/MountCourseQueryHooks';

describe('Sequence Navigation Dropdown', () => {
  let mockData;
  let courseId;
  let sequenceId;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = Array.from({ length: 3 }).map(() => Factory.build(
    'block',
    { type: 'vertical' },
    { courseId: courseMetadata.id },
  ));

  beforeAll(async () => {
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    ({ courseId, sequenceId } = getTestStoreIds(store));
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
      const { container } = render(
        <MemoryRouter initialEntries={[`/course/${courseId}/${sequenceId}/${unit.id}`]}>
          <Routes>
            <Route
              path="/course/:courseId/:sequenceId/:unitId"
              element={(
                <>
                  <MountCourseQueryHooks courseId={courseId} sequenceId={sequenceId} />
                  <SequenceNavigationDropdown {...mockData} unitId={unit.id} />
                </>
              )}
            />
          </Routes>
        </MemoryRouter>,
      );
      const dropdownToggle = container.querySelector('.dropdown-toggle');
      await act(async () => {
        await fireEvent.click(dropdownToggle);
      });
      await screen.findByText(unit.display_name);
      const dropdownMenu = container.querySelector('.dropdown-menu');
      // Only the current unit should be marked as active.
      getAllByRole(dropdownMenu, 'link', { hidden: true }).forEach(button => {
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
    const { container } = render(
      <SequenceNavigationDropdown {...mockData} onNavigate={onNavigate} />,
      { wrapWithRouter: true },
    );

    const dropdownToggle = container.querySelector('.dropdown-toggle');
    act(() => {
      fireEvent.click(dropdownToggle);
    });
    const dropdownMenu = container.querySelector('.dropdown-menu');
    getAllByRole(dropdownMenu, 'link', { hidden: true }).forEach(button => fireEvent.click(button));
    expect(onNavigate).toHaveBeenCalledTimes(unitBlocks.length);
    unitBlocks.forEach((unit, index) => {
      expect(onNavigate).toHaveBeenNthCalledWith(index + 1, unit.id);
    });
  });
});

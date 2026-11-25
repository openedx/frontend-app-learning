import { Factory } from 'rosie';
import {
  act, fireEvent, getAllByRole, screen,
} from '@testing-library/react';

import { mockCourseRequests, renderInCourseware } from '@src/tests/courseware';
import { render } from '@src/tests/render';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';

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
    ({ courseId, sequenceId } = mockCourseRequests({ courseMetadata, unitBlocks }));
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
      const { container } = renderInCourseware(
        <SequenceNavigationDropdown {...mockData} unitId={unit.id} />,
        { courseId, sequenceId, unitId: unit.id },
      );
      const dropdownToggle = await screen.findByRole('button');
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

  it('handles the clicks', async () => {
    const onNavigate = jest.fn();
    const { container } = renderInCourseware(
      <SequenceNavigationDropdown {...mockData} onNavigate={onNavigate} />,
      { courseId, sequenceId },
    );

    const dropdownToggle = await screen.findByRole('button');
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

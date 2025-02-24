import React from 'react';
import { Factory } from 'rosie';
import {
  fireEvent, initializeTestStore, render, screen,
} from '../../../../setupTest';
import UnitButton from './UnitButton';

describe('Unit Button', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = [Factory.build(
    'block',
    { type: 'problem' },
    { courseId: courseMetadata.id },
  ), Factory.build(
    'block',
    { type: 'video', complete: true },
    { courseId: courseMetadata.id },
  ), Factory.build(
    'block',
    { type: 'other', complete: true, bookmarked: true },
    { courseId: courseMetadata.id },
  )];
  const [unit, completedUnit, bookmarkedUnit] = unitBlocks;

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, unitBlocks });
    mockData = {
      unitId: unit.id,
      onClick: () => {},
      unitIndex: courseMetadata.id,
    };
  });

  it('hides title by default', () => {
    render(<UnitButton {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByRole('link')).not.toHaveTextContent(unit.display_name);
  });

  it('shows title', () => {
    render(<UnitButton {...mockData} showTitle />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent(unit.display_name);
  });

  it('check button attributes', () => {
    render(<UnitButton {...mockData} showTitle />);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', `${unit.display_name}-${courseMetadata.id}`);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-controls', unit.display_name);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', unit.display_name);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '-1');
  });

  it('button with isActive prop has tabindex 0', () => {
    render(<UnitButton {...mockData} isActive />);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
  });

  it('does not show completion for non-completed unit', () => {
    const { container } = render(<UnitButton {...mockData} />);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('shows completion for completed unit', () => {
    const { container } = render(<UnitButton {...mockData} unitId={completedUnit.id} />, { wrapWithRouter: true });
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(2);
    expect(buttonIcons[1]).toHaveClass('fa-check');
  });

  it('hides completion', () => {
    const { container } = render(<UnitButton {...mockData} unitId={completedUnit.id} showCompletion={false} />);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('does not show bookmark', () => {
    const { queryByTestId } = render(<UnitButton {...mockData} />);
    expect(queryByTestId('bookmark-icon')).toBeNull();
  });

  it('shows bookmark', () => {
    const { container } = render(<UnitButton {...mockData} unitId={bookmarkedUnit.id} />, { wrapWithRouter: true });
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(3);

    const bookmarkIcon = buttonIcons[2].closest('span');
    expect(bookmarkIcon.getAttribute('data-testid')).toBe('bookmark-icon');
  });

  it('handles the click', () => {
    const onClick = jest.fn();
    render(<UnitButton {...mockData} onClick={onClick} />, { wrapWithRouter: true });
    fireEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

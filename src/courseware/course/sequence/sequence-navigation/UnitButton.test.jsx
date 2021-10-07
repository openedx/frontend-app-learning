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
    };
  });

  it('hides title by default', () => {
    render(<UnitButton {...mockData} />);
    expect(screen.getByRole('button')).not.toHaveTextContent(unit.display_name);
  });

  it('shows title', () => {
    render(<UnitButton {...mockData} showTitle />);
    expect(screen.getByRole('button')).toHaveTextContent(unit.display_name);
  });

  it('does not show completion for non-completed unit', () => {
    const { container } = render(<UnitButton {...mockData} />);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('shows completion for completed unit', () => {
    const { container } = render(<UnitButton {...mockData} unitId={completedUnit.id} />);
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
    const { container } = render(<UnitButton {...mockData} />);
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-bookmark');
    });
  });

  it('shows bookmark', () => {
    const { container } = render(<UnitButton {...mockData} unitId={bookmarkedUnit.id} />);
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(3);
    expect(buttonIcons[2]).toHaveClass('fa-bookmark');
  });

  it('handles the click', () => {
    const onClick = jest.fn();
    render(<UnitButton {...mockData} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

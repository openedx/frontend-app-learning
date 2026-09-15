import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Factory } from 'rosie';
import {
  fireEvent, initializeTestStore, render, screen,
} from '../../../../setupTest';
import UnitButton from './UnitButton';

describe('Unit Button', () => {
  let mockData;
  let courseId;
  let sequenceId;
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
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    ({ courseId, sequenceId } = store.getState().courseware);
    mockData = {
      unitId: unit.id,
      onClick: () => {},
    };
  });

  it('hides title by default', () => {
    render(<UnitButton {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByRole('link')).not.toHaveTextContent(unit.display_name);
  });

  it('shows title', () => {
    render(<UnitButton {...mockData} showTitle />, { wrapWithRouter: true });
    expect(screen.getByRole('link')).toHaveTextContent(unit.display_name);
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

  it('falls back to the passed title and contentType when the unit has no model entry', () => {
    const { container } = render(
      <UnitButton {...mockData} unitId="block-without-model-entry" title="" contentType="lock" />,
      { wrapWithRouter: true },
    );
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(1);
    expect(buttonIcons[0]).toHaveClass('fa-lock');
    expect(screen.queryByTestId('bookmark-icon')).toBeNull();
  });

  it('prefixes the unit link with /preview on a preview route', () => {
    const unitPath = `/course/${courseId}/${sequenceId}/${unit.id}`;
    render(
      <MemoryRouter initialEntries={[`/preview${unitPath}`]}>
        <UnitButton {...mockData} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', `/preview${unitPath}`);
  });
});

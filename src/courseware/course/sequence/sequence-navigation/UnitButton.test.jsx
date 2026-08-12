import React from 'react';
import { Factory } from 'rosie';
import {
  act,
  fireEvent,
  initializeTestStore,
  render,
  screen,
  waitFor,
} from '../../../../setupTest';
import UnitButton from './UnitButton';
import messages from './messages';

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
      unitIdx: 0,
    };

    global.requestAnimationFrame = jest.fn((cb) => {
      setImmediate(cb);
    });
  });

  it('hides title by default', () => {
    render(<UnitButton {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByRole('tabpanel')).not.toHaveTextContent(unit.display_name);
  });

  it('shows title', () => {
    render(<UnitButton {...mockData} showTitle />, { wrapWithRouter: true });
    expect(screen.getByRole('tabpanel')).toHaveTextContent(unit.display_name);
  });

  it('check button attributes', () => {
    render(<UnitButton {...mockData} showTitle />, { wrapWithRouter: true });
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', `${unit.display_name}-0`);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-controls', unit.display_name);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', unit.display_name);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '-1');
  });

  it('button with isActive prop has tabindex 0', () => {
    render(<UnitButton {...mockData} isActive />, { wrapWithRouter: true });
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
    fireEvent.click(screen.getByRole('tabpanel'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('focuses the bookmark button after key press', async () => {
    jest.useFakeTimers();

    const { container } = render(
      <>
        <UnitButton {...mockData} />
        <button id="bookmark-button" type="button">{messages.bookmark.defaultMessage}</button>
      </>,
      { wrapWithRouter: true },
    );
    const unitButton = container.querySelector('[role="tabpanel"]');

    fireEvent.keyDown(unitButton, { key: 'Enter' });

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(document.activeElement).toBe(document.getElementById('bookmark-button'));
    });

    jest.useRealTimers();
  });

  it('calls onClick and focuses bookmark button on Enter or Space key press', async () => {
    const onClick = jest.fn();
    const { container } = render(
      <>
        <UnitButton {...mockData} onClick={onClick} />
        <button id="bookmark-button" type="button">{messages.bookmark.defaultMessage}</button>
      </>,
      { wrapWithRouter: true },
    );

    const unitButton = container.querySelector('[role="tabpanel"]');

    await act(async () => {
      fireEvent.keyDown(unitButton, { key: 'Enter' });
    });

    await waitFor(() => {
      expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(document.getElementById('bookmark-button'));
    });

    await act(async () => {
      fireEvent.keyDown(unitButton, { key: ' ' });
    });

    await waitFor(() => {
      expect(requestAnimationFrame).toHaveBeenCalledTimes(4);
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(document.activeElement).toBe(document.getElementById('bookmark-button'));
    });
  });
});

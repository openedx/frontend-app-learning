import React from 'react';
import { Factory } from 'rosie';
import userEvent from '@testing-library/user-event';

import {
  initializeTestStore, render, screen,
} from '@src/setupTest';
import UnitButton from './UnitButton';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/preview/anything' }),
  };
});

describe('Unit Button', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');

  afterEach(() => {
    jest.resetModules();
  });

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
    render(<UnitButton {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByRole('tab')).not.toHaveTextContent(unit.display_name);
  });

  it('shows title', () => {
    render(<UnitButton {...mockData} showTitle />, { wrapWithRouter: true });
    expect(screen.getByRole('tab')).toHaveTextContent(unit.display_name);
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

  it('handles the click', async () => {
    const onClick = jest.fn();
    render(<UnitButton {...mockData} onClick={onClick} />, { wrapWithRouter: true });
    await userEvent.click(screen.getByRole('tab'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick with correct unitId when clicked', async () => {
    const onClick = jest.fn();
    render(<UnitButton {...mockData} onClick={onClick} />, { wrapWithRouter: true });

    await userEvent.click(screen.getByRole('tab'));

    expect(onClick).toHaveBeenCalledWith(mockData.unitId);
  });

  it('renders with no unitId and does not crash', async () => {
    render(<UnitButton unitId={undefined} onClick={jest.fn()} contentType="video" title="Unit" />, {
      wrapWithRouter: true,
    });

    expect(screen.getByRole('tab')).toBeInTheDocument();
  });

  it('prepends /preview to the unit path if in preview mode', () => {
    const onClick = jest.fn();

    render(
      <UnitButton {...mockData} onClick={onClick} />,
      {
        wrapWithRouter: true,
        initialEntries: ['/preview/some/path'],
      },
    );

    const button = screen.getByRole('tab');
    expect(button.closest('a')).toHaveAttribute('href', expect.stringContaining('/preview/course/'));
  });
});

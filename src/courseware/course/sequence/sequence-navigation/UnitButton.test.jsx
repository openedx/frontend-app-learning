import React from 'react';
import { render, screen, fireEvent } from '../../../../setupTest';
import UnitButton from './UnitButton';

describe('Unit Button', () => {
  const initialState = {
    models: {
      units: {
        other: {
          contentType: 'other',
          title: 'other-unit',
        },
        problem: {
          contentType: 'problem',
          title: 'problem-unit',
          complete: true,
          bookmarked: true,
        },
      },
    },
  };

  const mockData = {
    unitId: 'other',
    onClick: () => {},
  };

  it('hides title by default', () => {
    render(<UnitButton {...mockData} />, { initialState });
    expect(screen.getByRole('button')).not.toHaveTextContent('other-unit');
  });

  it('shows title', () => {
    render(<UnitButton {...mockData} showTitle />, { initialState });
    expect(screen.getByRole('button')).toHaveTextContent('other-unit');
  });

  it('does not show completion for non-completed unit', () => {
    const { container } = render(<UnitButton {...mockData} />, { initialState });
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('shows completion for completed unit', () => {
    const { container } = render(<UnitButton {...mockData} unitId="problem" />, { initialState });
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(3);
    expect(buttonIcons[1]).toHaveClass('fa-check');
  });

  it('hides completion', () => {
    const { container } = render(<UnitButton {...mockData} unitId="problem" showCompletion={false} />, { initialState });
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-check');
    });
  });

  it('does not show bookmark', () => {
    const { container } = render(<UnitButton {...mockData} />, { initialState });
    container.querySelectorAll('svg').forEach(icon => {
      expect(icon).not.toHaveClass('fa-bookmark');
    });
  });

  it('shows bookmark', () => {
    const { container } = render(<UnitButton {...mockData} unitId="problem" />, { initialState });
    const buttonIcons = container.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(3);
    expect(buttonIcons[2]).toHaveClass('fa-bookmark');
  });

  it('handles the click', () => {
    const onClick = jest.fn();
    render(<UnitButton {...mockData} onClick={onClick} />, { initialState });
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

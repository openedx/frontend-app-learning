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
    render(<UnitButton {...mockData} />, { initialState });
    expect(screen.queryByAltText('fa-check')).toBeNull();
  });

  it('shows completion for completed unit', () => {
    render(<UnitButton {...mockData} unitId="problem" />, { initialState });
    expect(screen.getByAltText('fa-check')).toBeInTheDocument();
  });

  it('hides completion', () => {
    render(<UnitButton {...mockData} unitId="problem" showCompletion={false} />, { initialState });
    expect(screen.queryByAltText('fa-check')).toBeNull();
  });

  it('does not show bookmark', () => {
    render(<UnitButton {...mockData} />, { initialState });
    expect(screen.queryByAltText('fa-bookmark')).toBeNull();
  });

  it('shows bookmark', () => {
    render(<UnitButton {...mockData} unitId="problem" />, { initialState });
    expect(screen.getByAltText('fa-bookmark')).toBeInTheDocument();
  });

  it('handles the click', () => {
    const onClick = jest.fn();
    render(<UnitButton {...mockData} onClick={onClick} />, { initialState });
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

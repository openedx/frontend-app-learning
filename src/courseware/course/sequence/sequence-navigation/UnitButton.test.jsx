import React from 'react';
import { fireEvent } from '@testing-library/dom';
import { render, screen } from '../../../../setupTest';
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
    const { asFragment } = render(<UnitButton {...mockData} />, { initialState });
    expect(screen.getByTestId('icon')).toBeEmptyDOMElement();
    expect(asFragment()).toMatchSnapshot();
  });

  it('shows title', () => {
    const { asFragment } = render(<UnitButton {...mockData} showTitle />, { initialState });
    expect(screen.getByRole('button')).toHaveTextContent('other-unit');
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not show completion for non-completed unit', () => {
    const { asFragment } = render(<UnitButton {...mockData} />, { initialState });
    expect(screen.queryByAltText('fa-check')).toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });

  it('shows completion for completed unit', () => {
    const { asFragment } = render(<UnitButton {...mockData} unitId="problem" />, { initialState });
    expect(screen.getByAltText('fa-check')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('hides completion', () => {
    const { asFragment } = render(<UnitButton {...mockData} unitId="problem" showCompletion={false} />, { initialState });
    expect(screen.queryByAltText('fa-check')).toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not show bookmark', () => {
    const { asFragment } = render(<UnitButton {...mockData} />, { initialState });
    expect(screen.queryByAltText('fa-bookmark')).toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });

  it('shows bookmark', () => {
    const { asFragment } = render(<UnitButton {...mockData} unitId="problem" />, { initialState });
    expect(screen.getByAltText('fa-bookmark')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('handles the click', () => {
    const onClick = jest.fn();
    render(<UnitButton {...mockData} onClick={onClick} />, { initialState });
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

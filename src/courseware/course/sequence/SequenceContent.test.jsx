import React from 'react';
import { initialState, render, screen } from '../../../setupTest';
import SequenceContent from './SequenceContent';

describe('Sequence Content', () => {
  const mockData = {
    gated: false,
    courseId: '1',
    sequenceId: '1',
    unitId: '1',
    unitLoadedHandler: () => {},
    intl: {},
  };

  it('displays loading message', () => {
    const { asFragment } = render(<SequenceContent {...mockData} />, { initialState });
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays messages for the locked content', async () => {
    const { asFragment } = render(<SequenceContent {...mockData} gated />, { initialState });
    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();

    expect(await screen.findByText(/content locked/i)).toBeInTheDocument();
    expect(screen.getByText('test-sequence')).toBeInTheDocument();
    expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays message for no content', () => {
    const { asFragment } = render(<SequenceContent {...mockData} unitId={null} />, { initialState });
    expect(screen.getByText('There is no content here.')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});

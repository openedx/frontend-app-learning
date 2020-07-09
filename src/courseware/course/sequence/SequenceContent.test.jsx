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
    render(<SequenceContent {...mockData} />, { initialState });
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
  });

  it('displays messages for the locked content', async () => {
    render(<SequenceContent {...mockData} gated />, { initialState });
    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();

    expect(await screen.findByText('Content Locked')).toBeInTheDocument();
    expect(screen.getByText('test-sequence')).toBeInTheDocument();
    expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
    expect(screen.getByAltText('fa-lock')).toBeInTheDocument();
    expect(screen.getByText(/You must complete the prerequisite/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go To Prerequisite Section' })).toBeInTheDocument();
  });

  it('displays message for no content', () => {
    render(<SequenceContent {...mockData} unitId={null} />, { initialState });
    expect(screen.getByText('There is no content here.')).toBeInTheDocument();
  });
});

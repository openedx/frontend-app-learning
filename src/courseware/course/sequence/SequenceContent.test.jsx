import React from 'react';
import {
  getTestStoreIds, initializeTestStore, render, screen,
} from '../../../setupTest';
import SequenceContent from './SequenceContent';

describe('Sequence Content', () => {
  let mockData;
  let store;

  beforeAll(async () => {
    store = await initializeTestStore();
    const { models } = store.getState();
    const { courseId, sequenceId } = getTestStoreIds(store);
    mockData = {
      gated: false,
      courseId,
      sequenceId,
      unitId: models.sequences[sequenceId].unitIds[0],
      unitLoadedHandler: () => { },
      renderUnitNavigation: () => { },
    };
  });

  it('displays loading message', () => {
    render(<SequenceContent {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByText('Loading learning sequence...')).toBeInTheDocument();
  });

  it('displays messages for the locked content', async () => {
    const { gatedContent } = store.getState().models.sequences[mockData.sequenceId];
    const { container } = render(<SequenceContent {...mockData} gated />, { wrapWithRouter: true });

    expect(screen.getByText('Loading locked content messaging...')).toBeInTheDocument();
    expect(await screen.findByText('Content Locked')).toBeInTheDocument();
    expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveClass('fa-lock');
    expect(screen.getByText(
      `You must complete the prerequisite: '${gatedContent.prereqSectionName}' to access this content.`,
    )).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go To Prerequisite Section' })).toBeInTheDocument();
  });

  it('displays message for no content', () => {
    render(<SequenceContent {...mockData} unitId="" />, { wrapWithRouter: true });
    expect(screen.getByText('There is no content here.')).toBeInTheDocument();
  });
});

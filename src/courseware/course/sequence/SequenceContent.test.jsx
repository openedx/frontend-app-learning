import React from 'react';
import {
  getTestStoreIds, initializeTestStore, render, screen,
} from '../../../setupTest';
import MountCourseQueryHooks from '../../../tests/MountCourseQueryHooks';
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

  const renderContent = (props = {}) => render(
    <>
      <MountCourseQueryHooks courseId={mockData.courseId} sequenceId={mockData.sequenceId} />
      <SequenceContent {...mockData} {...props} />
    </>,
    { wrapWithRouter: true },
  );

  it('displays loading message', async () => {
    renderContent();
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();
  });

  it('displays messages for the locked content', async () => {
    const { gatedContent } = store.getState().models.sequences[mockData.sequenceId];
    const { container } = renderContent({ gated: true });

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
    renderContent({ unitId: '' });
    expect(screen.getByText('There is no content here.')).toBeInTheDocument();
  });
});

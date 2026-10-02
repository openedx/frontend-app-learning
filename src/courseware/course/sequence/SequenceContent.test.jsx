import React from 'react';
import PropTypes from 'prop-types';
import {
  mockCourseRequests, render, screen,
} from '../../../setupTest';
import initializeStore from '../../../store';
import MountCourseQueryHooks from '../../../tests/MountCourseQueryHooks';
import { useSequenceMetadata } from '../../data/apiHooks';
import SequenceContent from './SequenceContent';

describe('Sequence Content', () => {
  let mockData;
  let gatedContent;
  const store = initializeStore();

  beforeAll(() => {
    const {
      courseId, sequenceId, unitId, sequenceMetadata,
    } = mockCourseRequests();
    [{ gated_content: gatedContent }] = sequenceMetadata;
    mockData = {
      gated: false,
      courseId,
      sequenceId,
      unitId,
      unitLoadedHandler: () => { },
      renderUnitNavigation: () => { },
    };
  });

  // Sequence renders SequenceContent only once the sequence query has succeeded.
  const LoadedSequenceContent = (props) => (
    useSequenceMetadata(props.sequenceId, { enabled: false }).isSuccess ? <SequenceContent {...props} /> : null
  );

  LoadedSequenceContent.propTypes = {
    sequenceId: PropTypes.string.isRequired,
  };

  const renderContent = (props = {}) => render(
    <>
      <MountCourseQueryHooks courseId={mockData.courseId} sequenceId={mockData.sequenceId} />
      <LoadedSequenceContent {...mockData} {...props} />
    </>,
    { store, wrapWithRouter: true },
  );

  it('displays loading message', async () => {
    renderContent();
    expect(await screen.findByText('Loading learning sequence...')).toBeInTheDocument();
  });

  it('displays messages for the locked content', async () => {
    const { container } = renderContent({ gated: true });

    await screen.findByText('Loading locked content messaging...');
    expect(await screen.findByText('Content Locked')).toBeInTheDocument();
    expect(screen.queryByText('Loading locked content messaging...')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveClass('fa-lock');
    expect(screen.getByText(
      `You must complete the prerequisite: '${gatedContent.prereq_section_name}' to access this content.`,
    )).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go To Prerequisite Section' })).toBeInTheDocument();
  });

  it('displays message for no content', async () => {
    renderContent({ unitId: '' });
    expect(await screen.findByText('There is no content here.')).toBeInTheDocument();
  });
});

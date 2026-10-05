import React from 'react';
import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import { act } from '@testing-library/react';
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
  let secondUnitId;
  // Unit (rendered by the loaded-content tests) selects from the Redux store, so
  // those renders need a Provider. The focus tests render the "no content" branch
  // and do not need it.
  const store = initializeStore();

  beforeAll(() => {
    // Build the course with two units so the focus tests can navigate from the
    // first unit to a second one.
    const courseId = 'course-v1:edX+DemoX+Demo_Course';
    const unitBlocks = [
      Factory.build('block', { type: 'vertical' }, { courseId }),
      Factory.build('block', { type: 'vertical' }, { courseId }),
    ];
    const {
      sequenceId, unitId, sequenceMetadata, unitBlocks: builtUnitBlocks,
    } = mockCourseRequests({ unitBlocks });
    [{ gated_content: gatedContent }] = sequenceMetadata;
    secondUnitId = builtUnitBlocks[1].id;
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

  it('moves focus to div.app-container after unit navigation', async () => {
    // JSDOM does not include the app shell markup, so we create the element manually
    // to match the real DOM structure the focus logic targets.
    const appContainer = global.document.createElement('div');
    appContainer.className = 'app-container';
    global.document.body.appendChild(appContainer);

    render(<SequenceContent {...mockData} />, { wrapWithRouter: true });

    // Simulate navigating to the next unit by re-rendering with a new unitId.
    // A second render call is used instead of rerender because rerender bypasses
    // the provider wrappers from setupTest's custom render helper.
    // We use act to flush the useEffect triggered by the unitId change.
    await act(async () => {
      render(<SequenceContent {...mockData} unitId={secondUnitId} />, { wrapWithRouter: true });
    });

    expect(appContainer).toHaveAttribute('tabindex', '-1');
    expect(appContainer).toHaveFocus();

    global.document.body.removeChild(appContainer);
  });

  it('falls back to focusing document.body when div.app-container is absent', async () => {
    // Verify div.app-container is not in the DOM for this test — if a previous
    // test left one behind, this assertion would give a false negative.
    expect(global.document.querySelector('div.app-container')).toBeNull();

    render(<SequenceContent {...mockData} />, { wrapWithRouter: true });

    // A second render call is used instead of rerender — see comment above.
    await act(async () => {
      render(<SequenceContent {...mockData} unitId={secondUnitId} />, { wrapWithRouter: true });
    });

    expect(global.document.body).toHaveFocus();
  });
});

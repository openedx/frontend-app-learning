import React from 'react';
import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import { act } from '@testing-library/react';
import {
  mockCourseRequests, render, screen,
} from '../../../setupTest';
import MountCourseQueryHooks from '../../../tests/MountCourseQueryHooks';
import { useSequenceMetadata } from '../../data/apiHooks';
import SequenceContent from './SequenceContent';
import SpecialExamsProvider from '../../../generic/special-exams/SpecialExamsProvider';

describe('Sequence Content', () => {
  let mockData;
  let gatedContent;
  let secondUnitId;

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
    <SpecialExamsProvider>
      <MountCourseQueryHooks courseId={mockData.courseId} sequenceId={mockData.sequenceId} />
      <LoadedSequenceContent {...mockData} {...props} />
    </SpecialExamsProvider>,
    { wrapWithRouter: true },
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

  it('does not move focus on initial load', async () => {
    // Even when the heading is present, the initial page load must not steal focus,
    // so the normal page start (e.g. the "Skip to main content" link) is preserved.
    const heading = global.document.createElement('h3');
    heading.id = 'courseware-unit-title';
    heading.setAttribute('tabindex', '-1');
    global.document.body.appendChild(heading);

    await act(async () => {
      render(<SequenceContent {...mockData} />, { wrapWithRouter: true });
    });

    expect(heading).not.toHaveFocus();

    global.document.body.removeChild(heading);
  });

  it('moves focus to the unit heading after unit navigation', async () => {
    // JSDOM does not render the full unit shell here, so we create the heading the
    // focus logic targets, matching the real DOM (UnitTitleSlot renders an
    // <h3 id="courseware-unit-title" tabindex="-1">).
    const heading = global.document.createElement('h3');
    heading.id = 'courseware-unit-title';
    heading.setAttribute('tabindex', '-1');
    global.document.body.appendChild(heading);

    const { rerender } = render(<SequenceContent {...mockData} />, { wrapWithRouter: true });

    // Simulate next/previous navigation by re-rendering the same instance with a new
    // unitId. rerender preserves the provider wrappers (they are applied via the
    // wrapper option in setupTest's render helper). act flushes the focus effect.
    await act(async () => {
      rerender(<SequenceContent {...mockData} unitId={secondUnitId} />);
    });

    expect(heading).toHaveFocus();

    global.document.body.removeChild(heading);
  });

  it('falls back to div.app-container when navigation lands on content without a unit heading', async () => {
    // JSDOM does not include the app shell markup, so we create the element manually
    // to match the real DOM structure the fallback targets.
    const appContainer = global.document.createElement('div');
    appContainer.className = 'app-container';
    global.document.body.appendChild(appContainer);

    // Navigate from a real unit to the "no content" branch (unitId=''), which renders
    // no unit heading.
    const { rerender } = render(<SequenceContent {...mockData} />, { wrapWithRouter: true });
    await act(async () => {
      rerender(<SequenceContent {...mockData} unitId="" />);
    });

    expect(appContainer).toHaveAttribute('tabindex', '-1');
    expect(appContainer).toHaveFocus();

    global.document.body.removeChild(appContainer);
  });

  it('falls back to document.body when neither heading nor div.app-container is present', async () => {
    // Verify neither fallback-preempting element is in the DOM for this test — if a
    // previous test left one behind, this assertion would give a false negative.
    expect(global.document.getElementById('courseware-unit-title')).toBeNull();
    expect(global.document.querySelector('div.app-container')).toBeNull();

    const { rerender } = render(<SequenceContent {...mockData} />, { wrapWithRouter: true });
    await act(async () => {
      rerender(<SequenceContent {...mockData} unitId="" />);
    });

    expect(global.document.body).toHaveFocus();
  });
});

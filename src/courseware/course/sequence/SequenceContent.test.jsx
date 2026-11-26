import { screen } from '@testing-library/react';

import SpecialExamsProvider from '@src/generic/special-exams/SpecialExamsProvider';
import { mockCourseRequests, renderInCourseware } from '@src/tests/courseware';
import SequenceContent from './SequenceContent';

describe('Sequence Content', () => {
  let mockData;
  let gatedContent;

  beforeAll(() => {
    global.scrollTo = jest.fn();
  });

  beforeEach(() => {
    const {
      courseId, sequenceId, unitId, sequenceMetadata,
    } = mockCourseRequests();
    [{ gated_content: gatedContent }] = sequenceMetadata;
    mockData = {
      gated: false,
      courseId,
      sequenceId,
      unitId,
      isOriginalUserStaff: false,
      unitLoadedHandler: () => { },
      renderUnitNavigation: () => { },
    };
  });

  // Sequence renders SequenceContent only once the sequence query has succeeded, under the special exams provider.
  const renderContent = (props = {}) => renderInCourseware(
    <SpecialExamsProvider><SequenceContent {...mockData} {...props} /></SpecialExamsProvider>,
    { courseId: mockData.courseId, sequenceId: mockData.sequenceId, states: { sequence: 'success' } },
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

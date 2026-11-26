import { MemoryRouter } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { getCourseOutline } from '@src/courseware/data/api';
import { mockCourseRequests } from '@src/tests/courseware';
import { CourseParamsProvider } from '@src/generic/course-params';
import OutlineQueryGate from '@src/tests/OutlineQueryGate';
import { render } from '@src/tests/render';
import { SidebarProvider } from '../../../SidebarContext';
import messages from '../messages';
import SidebarSequence from './SidebarSequence';

describe('<SidebarSequence />', () => {
  let courseId;
  let sequence;
  let unit;
  const sequenceDescription = 'sequence test description';

  const initTestData = async (options) => {
    courseId = mockCourseRequests(options).courseId;
    const outline = await getCourseOutline(courseId);
    const [activeSequenceId] = Object.keys(outline.sequences);
    sequence = outline.sequences[activeSequenceId];
    const unitId = sequence.unitIds[0];
    unit = outline.units[unitId];
  };

  // The rows read the outline and completion tracking from their queries, which mockCourseRequests answers.
  function renderWithProvider(props = {}) {
    const { container } = render(
      <MemoryRouter>
        <CourseParamsProvider courseId={courseId}>
          <SidebarProvider courseId={courseId} unitId={unit.id} widgets={[]}>
            <OutlineQueryGate>
              <SidebarSequence
                courseId={courseId}
                defaultOpen={false}
                sequence={sequence}
                activeUnitId={sequence.unitIds[0]}
                {...props}
              />
            </OutlineQueryGate>
          </SidebarProvider>
        </CourseParamsProvider>
      </MemoryRouter>,
    );
    return container;
  }

  it('renders correctly when sequence is collapsed and incomplete', async () => {
    await initTestData();
    renderWithProvider();

    expect(await screen.findByText(sequence.title)).toBeInTheDocument();
    expect(screen.queryByText(sequenceDescription)).not.toBeInTheDocument();
    expect(screen.getByText(`, ${courseOutlineMessages.incompleteAssignment.defaultMessage}`)).toBeInTheDocument();
    expect(screen.queryByText(unit.title)).not.toBeInTheDocument();
  });

  it('renders correctly when sequence is not collapsed and complete and completion tracking enabled', async () => {
    const user = userEvent.setup();
    await initTestData();
    renderWithProvider({
      defaultOpen: true,
      sequence: {
        ...sequence,
        specialExamInfo: sequenceDescription,
        complete: true,
      },
    });

    expect(await screen.findByText(sequence.title)).toBeInTheDocument();
    expect(screen.getByText(sequenceDescription)).toBeInTheDocument();
    expect(screen.getByText(`, ${courseOutlineMessages.completedAssignment.defaultMessage}`)).toBeInTheDocument();
    expect(screen.getByText(unit.title)).toBeInTheDocument();
    expect(screen.getByText(`, ${messages.incompleteUnit.defaultMessage}`)).toBeInTheDocument();

    await user.click(screen.getByText(sequence.title));
    await waitFor(() => {
      expect(screen.queryByText(unit.title)).not.toBeInTheDocument();
      expect(screen.queryByText(`, ${messages.incompleteUnit.defaultMessage}`)).not.toBeInTheDocument();
    });
  });
});

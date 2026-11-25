import { MemoryRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { getCourseOutline } from '@src/courseware/data/api';
import { CourseParamsProvider } from '@src/generic/course-params';
import { mockCourseRequests } from '@src/tests/courseware';
import { render } from '@src/tests/render';
import { SidebarProvider } from '../../../SidebarContext';
import SidebarSection from './SidebarSection';

describe('<SidebarSection />', () => {
  let mockHandleSelectSection;
  let courseId;
  let section;

  const initTestData = async (options) => {
    courseId = mockCourseRequests(options).courseId;
    const outline = await getCourseOutline(courseId);
    const [activeSectionId] = Object.keys(outline.sections);
    section = outline.sections[activeSectionId];
  };

  // The section reads completion tracking from the toggles query, which mockCourseRequests answers.
  const renderSection = (props = {}) => render(
    <MemoryRouter>
      <CourseParamsProvider courseId={courseId}>
        <SidebarProvider courseId={courseId} unitId="unit-1" widgets={[]}>
          <SidebarSection
            section={section}
            handleSelectSection={mockHandleSelectSection}
            {...props}
          />
        </SidebarProvider>
      </CourseParamsProvider>
    </MemoryRouter>,
  );

  beforeEach(() => {
    mockHandleSelectSection = jest.fn();
  });

  it('renders correctly when section is incomplete', async () => {
    const user = userEvent.setup();
    await initTestData();
    const { container } = renderSection();

    expect(screen.getByText(section.title)).toBeInTheDocument();
    expect(await screen.findByText(`, ${courseOutlineMessages.incompleteSection.defaultMessage}`)).toBeInTheDocument();
    expect(container.querySelector('.text-success')).not.toBeInTheDocument();

    const button = screen.getByText(section.title);
    await user.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });

  it('renders correctly when section is complete', async () => {
    const user = userEvent.setup();
    await initTestData();
    renderSection({ section: { ...section, completionStat: { completed: 4, total: 4 }, complete: true } });

    expect(screen.getByText(section.title)).toBeInTheDocument();
    expect(await screen.findByText(`, ${courseOutlineMessages.completedSection.defaultMessage}`)).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

    const button = screen.getByText(section.title);
    await user.click(button);
    expect(mockHandleSelectSection).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectSection).toHaveBeenCalledWith(section.id);
  });
});

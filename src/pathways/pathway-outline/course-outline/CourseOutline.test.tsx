import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { useCourseOutline } from '@src/pathways/data/apiHooks';
import { dataPipelinesOutline } from '@src/pathways/data/__fixtures__/courseOutline';

import { CourseOutline } from './CourseOutline';

jest.mock('@src/pathways/data/apiHooks', () => ({
  useCourseOutline: jest.fn(),
}));

const mockUseCourseOutline = useCourseOutline as jest.Mock;

const courseId = 'course-v1:edX+DE102+2026';

const renderComponent = () => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <CourseOutline courseId={courseId} />
    </MemoryRouter>
  </IntlProvider>,
);

describe('CourseOutline', () => {
  beforeEach(() => {
    mockUseCourseOutline.mockReset();
  });

  it('requests the outline of the given course', () => {
    mockUseCourseOutline.mockReturnValue({ data: dataPipelinesOutline, isPending: false, isError: false });
    renderComponent();
    expect(mockUseCourseOutline).toHaveBeenCalledWith(courseId);
  });

  it('shows a spinner while the outline is loading', () => {
    mockUseCourseOutline.mockReturnValue({ data: undefined, isPending: true, isError: false });
    renderComponent();
    expect(screen.getByText('Loading course outline…')).toBeInTheDocument();
  });

  it('shows an error when the outline fails to load', () => {
    mockUseCourseOutline.mockReturnValue({ data: undefined, isPending: false, isError: true });
    renderComponent();
    expect(screen.getByText('There was an error loading the outline of this course.')).toBeInTheDocument();
  });

  it('shows every section closed, with its completion', () => {
    mockUseCourseOutline.mockReturnValue({ data: dataPipelinesOutline, isPending: false, isError: false });
    renderComponent();

    const sections = screen.getAllByRole('button', { expanded: false });
    expect(sections).toHaveLength(dataPipelinesOutline.length);
    expect(sections[0]).toHaveTextContent('What is a Data Pipeline?, Incomplete section');
    expect(sections[1]).toHaveTextContent('Data Sources and Ingestion Methods, Completed section');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the subsections of a section when it opens, linked to the courseware', async () => {
    mockUseCourseOutline.mockReturnValue({ data: dataPipelinesOutline, isPending: false, isError: false });
    renderComponent();

    const section = screen.getByRole('button', { name: /What is a Data Pipeline\?/ });
    await userEvent.click(section);

    expect(section).toHaveAttribute('aria-expanded', 'true');
    const [first] = dataPipelinesOutline[0].subsections;
    expect(screen.getByRole('link', { name: /^Core Concepts\s*, Completed$/ })).toHaveAttribute(
      'href',
      `/course/${courseId}/${first.id}`,
    );
    expect(screen.getByRole('link', { name: /^Real-World Context\s*, Incomplete$/ })).toBeInTheDocument();
  });
});

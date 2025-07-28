import React from 'react';
import {
  initializeMockApp,
  render,
  screen,
} from '../../setupTest';
import CoursewareSearchResults from './CoursewareSearchResults';
import messages from './messages';
import searchResultsFactory from './test-data/search-results-factory';
import * as mock from './test-data/mocked-response.json';

jest.mock('react-redux');

function renderComponent({ results }) {
  const { container } = render(<CoursewareSearchResults results={results} />);
  return container;
}

describe('CoursewareSearchResults', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  describe('when an empty array is provided', () => {
    beforeEach(() => { renderComponent({ results: [] }); });

    it('should render a "no results found" message.', () => {
      expect(screen.getByTestId('no-results').textContent).toBe(messages.searchResultsNone.defaultMessage);
    });
  });

  describe('when list of results is provided', () => {
    beforeEach(() => {
      const { results } = searchResultsFactory('course');
      renderComponent({ results });
    });

    it('should render complete list', () => {
      const courses = screen.getAllByRole('link');
      expect(courses.length).toBe(mock.results.length);
    });

    it('should render correct link for internal course', () => {
      const courses = screen.getAllByRole('link');
      const firstCourse = courses[0];
      const firstCourseTitle = firstCourse.querySelector('.courseware-search-results__title span');
      expect(firstCourseTitle.innerHTML).toEqual(mock.results[0].data.content.display_name);
      expect(firstCourse.href).toContain(mock.results[0].data.url);
      expect(firstCourse).not.toHaveAttribute('target', '_blank');
      expect(firstCourse).not.toHaveAttribute('rel', 'nofollow');
    });

    it('should render correct link if is External url course', () => {
      const courses = screen.getAllByRole('link');
      const externalCourse = courses[courses.length - 1];
      const externalCourseTitle = externalCourse.querySelector('.courseware-search-results__title span');
      expect(externalCourseTitle.innerHTML).toEqual(mock.results[mock.results.length - 1].data.content.display_name);
      expect(externalCourse.href).toContain(mock.results[mock.results.length - 1].data.url);
      expect(externalCourse).toHaveAttribute('target', '_blank');
      expect(externalCourse).toHaveAttribute('rel', 'nofollow');
      const icon = externalCourse.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render location breadcrumbs', () => {
      const breadcrumbs = screen.getAllByText(mock.results[0].data.location[0]);
      expect(breadcrumbs.length).toBeGreaterThan(0);
      const firstBreadcrumb = breadcrumbs[0].closest('li');
      expect(firstBreadcrumb).toBeInTheDocument();
      expect(firstBreadcrumb.querySelector('div').textContent).toBe(mock.results[0].data.location[0]);
      expect(firstBreadcrumb.nextSibling.querySelector('div').textContent).toBe(mock.results[0].data.location[1]);
    });
  });

  describe('when results are provided with content hits', () => {
    beforeEach(() => {
      const { results } = searchResultsFactory('Passing');
      renderComponent({ results });
    });

    it('should render content hits', () => {
      const contentHits = screen.getByText('1');
      expect(contentHits).toBeInTheDocument();
      expect(contentHits.tagName).toBe('EM');
    });
  });
});

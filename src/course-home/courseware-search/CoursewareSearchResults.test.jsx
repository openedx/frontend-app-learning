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

    it('should render correct title for first course', () => {
      const courses = screen.getAllByRole('link');
      const firstCourseTitle = courses[0].querySelector('.courseware-search-results__title span');
      expect(firstCourseTitle.innerHTML).toEqual(mock.results[0].data.content.display_name);
    });
  });
});

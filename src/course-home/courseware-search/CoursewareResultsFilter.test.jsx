import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';

import { render } from '@src/tests/render';
import { CoursewareSearchResultsFilter } from './CoursewareResultsFilter';
import { useCoursewareSearchParams } from './hooks';
import { useCoursewareSearchResults } from './data/apiHooks';
import searchResultsFactory from './test-data/search-results-factory';

jest.mock('./hooks');
jest.mock('./data/apiHooks');

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const decodedCourseId = 'course-v1:edX+DemoX+Demo_Course';
const decodedSequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction';
const decodedUnitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const pathname = `/course/${decodedCourseId}/${decodedSequenceId}/${decodedUnitId}`;

const coursewareSearch = {
  query: '',
  filter: '',
  setQuery: jest.fn(),
  setFilter: jest.fn(),
  clearSearchParams: jest.fn(),
};

function renderComponent(props = {}) {
  const { container } = render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/course/:courseId/:sequenceId/:unitId" element={<CoursewareSearchResultsFilter {...props} />} />
      </Routes>
    </MemoryRouter>,
  );
  return container;
}

describe('CoursewareSearchResultsFilter', () => {
  beforeEach(() => {
    useCoursewareSearchParams.mockReturnValue(coursewareSearch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when returning full results', () => {
    beforeEach(() => {
      useCoursewareSearchResults.mockReturnValue({ data: searchResultsFactory() });
      renderComponent();
    });

    it('should render without errors', async () => {
      await waitFor(() => {
        expect(useCoursewareSearchParams).toBeCalled();
      });

      expect(screen.queryByTestId('courseware-search-results-tabs')).toBeInTheDocument();
      expect(screen.queryByTestId('courseware-search-results-tabs-all')).toBeInTheDocument();
      expect(screen.queryByTestId('courseware-search-results-tabs-text')).toBeInTheDocument();
      expect(screen.queryByTestId('courseware-search-results-tabs-video')).toBeInTheDocument();
      expect(screen.queryByTestId('courseware-search-results-tabs-sequence')).toBeInTheDocument();
      expect(screen.queryByTestId('courseware-search-results-tabs-other')).toBeInTheDocument();
    });
  });

  describe('when returning only one result type', () => {
    beforeEach(async () => {
      // Get results for only videos
      const data = searchResultsFactory();
      const onlyVideos = {
        ...data,
        results: data.results.filter(({ type }) => type === 'video'),
      };

      useCoursewareSearchResults.mockReturnValue({ data: onlyVideos });
      await renderComponent();
    });

    it('should not render', async () => {
      await waitFor(() => {
        expect(useCoursewareSearchParams).toBeCalled();
      });

      expect(screen.queryByTestId('courseware-search-results-tabs')).not.toBeInTheDocument();
    });
  });

  describe('when there are not results', () => {
    beforeEach(async () => {
      useCoursewareSearchResults.mockReturnValue({
        data: searchResultsFactory('blah', {
          results: [],
          filters: [],
          total: 0,
          maxScore: null,
          ms: 5,
        }),
      });
      await renderComponent();
    });

    it('should not render', async () => {
      await waitFor(() => {
        expect(useCoursewareSearchParams).toBeCalled();
      });

      expect(screen.queryByTestId('courseware-search-results-tabs')).not.toBeInTheDocument();
    });
  });
});

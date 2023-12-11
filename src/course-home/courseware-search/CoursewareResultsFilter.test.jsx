import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { Route, Routes } from 'react-router-dom';
import { history } from '@edx/frontend-platform';
import {
  initializeMockApp,
  render,
  screen,
  waitFor,
} from '../../setupTest';
import { CoursewareSearchResultsFilter, filteredResultsBySelection } from './CoursewareResultsFilter';
import { useCoursewareSearchParams } from './hooks';
import initializeStore from '../../store';
import { useModel } from '../../generic/model-store';
import searchResultsFactory from './test-data/search-results-factory';

jest.mock('./hooks');
jest.mock('../../generic/model-store', () => ({
  useModel: jest.fn(),
}));

const mockResults = [
  {
    id: 'video-1', type: 'video', title: 'video_title', score: 3, contentHits: 1, url: '/video-1', location: ['path1', 'path2'],
  },
  {
    id: 'video-2', type: 'video', title: 'video_title2', score: 2, contentHits: 1, url: '/video-2', location: ['path1', 'path2'],
  },
  {
    id: 'document-1', type: 'document', title: 'document_title', score: 3, contentHits: 1, url: '/document-1', location: ['path1', 'path2'],
  },
  {
    id: 'text-1', type: 'text', title: 'text_title1', score: 3, contentHits: 1, url: '/text-1', location: ['path1', 'path2'],
  },
  {
    id: 'text-2', type: 'text', title: 'text_title2', score: 2, contentHits: 1, url: '/text-2', location: ['path1', 'path2'],
  },
  {
    id: 'text-3', type: 'text', title: 'text_title3', score: 1, contentHits: 1, url: '/text-3', location: ['path1', 'path2'],
  },
];

const decodedCourseId = 'course-v1:edX+DemoX+Demo_Course';
const decodedSequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction';
const decodedUnitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const pathname = `/course/${decodedCourseId}/${decodedSequenceId}/${decodedUnitId}`;

const intl = {
  formatMessage: (message) => message?.defaultMessage || '',
};

const coursewareSearch = {
  query: '',
  filter: '',
  setQuery: jest.fn(),
  setFilter: jest.fn(),
  clearSearchParams: jest.fn(),
};

function renderComponent(props = {}) {
  const store = initializeStore();
  history.push(pathname);
  const { container } = render(
    <AppProvider store={store}>
      <Routes>
        <Route path="/course/:courseId/:sequenceId/:unitId" element={<CoursewareSearchResultsFilter intl={intl} {...props} />} />
      </Routes>
    </AppProvider>,
  );
  return container;
}

describe('CoursewareSearchResultsFilter', () => {
  beforeAll(initializeMockApp);

  describe('filteredResultsBySelection', () => {
    it('returns a no values array when no results are provided', () => {
      const results = filteredResultsBySelection({});

      expect(results.length).toEqual(0);
    });

    it('returns all values when no key value is provided', () => {
      const results = filteredResultsBySelection({ results: mockResults });

      expect(results.length).toEqual(mockResults.length);
    });

    it('returns only "video"-typed elements when the key value "video" is given', () => {
      const results = filteredResultsBySelection({ key: 'video', results: mockResults });

      expect(results.length).toEqual(2);
    });

    it('returns only "course_outline"-typed elements when the key value "document" is given', () => {
      const results = filteredResultsBySelection({ key: 'document', results: mockResults });

      expect(results.length).toEqual(1);
    });

    it('returns only "text"-typed elements when the key value "text" is given', () => {
      const results = filteredResultsBySelection({ key: 'text', results: mockResults });

      expect(results.length).toEqual(3);
    });
  });

  describe('</CoursewareSearchResultsFilter />', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render', async () => {
      useCoursewareSearchParams.mockReturnValue(coursewareSearch);
      useModel.mockReturnValue(searchResultsFactory());

      await renderComponent();

      await waitFor(() => {
        expect(screen.queryByTestId('courseware-search-results-tabs')).toBeInTheDocument();
        expect(screen.queryByText(/All content/)).toBeInTheDocument();
      });
    });
  });
});

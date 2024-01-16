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
import { CoursewareSearchResultsFilter } from './CoursewareResultsFilter';
import { useCoursewareSearchParams } from './hooks';
import initializeStore from '../../store';
import { useModel } from '../../generic/model-store';
import searchResultsFactory from './test-data/search-results-factory';

jest.mock('./hooks');
jest.mock('../../generic/model-store', () => ({
  useModel: jest.fn(),
}));

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

  describe('</CoursewareSearchResultsFilter />', () => {
    beforeEach(() => {
      useCoursewareSearchParams.mockReturnValue(coursewareSearch);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should render without errors', async () => {
      useModel.mockReturnValue(searchResultsFactory());

      await renderComponent();

      await waitFor(() => {
        expect(screen.queryByTestId('courseware-search-results-tabs-all')).toBeInTheDocument();
        expect(screen.queryByTestId('courseware-search-results-tabs-text')).toBeInTheDocument();
        expect(screen.queryByTestId('courseware-search-results-tabs-video')).toBeInTheDocument();
        expect(screen.queryByTestId('courseware-search-results-tabs-sequence')).toBeInTheDocument();
        expect(screen.queryByTestId('courseware-search-results-tabs-other')).toBeInTheDocument();
      });
    });

    describe('when there are not results', () => {
      it('should render without errors', async () => {
        useModel.mockReturnValue(searchResultsFactory('blah', {
          results: [],
          filters: [],
          total: 0,
          maxScore: null,
          ms: 5,
        }));

        await renderComponent();

        await waitFor(() => {
          expect(screen.queryByTestId('courseware-search-results-tabs-all')).toBeInTheDocument();
          expect(screen.queryByTestId('courseware-search-results-tabs-text')).toBeInTheDocument();
          expect(screen.queryByTestId('courseware-search-results-tabs-video')).toBeInTheDocument();
          expect(screen.queryByTestId('courseware-search-results-tabs-sequence')).toBeInTheDocument();
          expect(screen.queryByTestId('courseware-search-results-tabs-other')).toBeInTheDocument();
        });
      });
    });
  });
});

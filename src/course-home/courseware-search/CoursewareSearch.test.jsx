import React from 'react';
import { history } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { Route, Routes } from 'react-router-dom';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import {
  initializeMockApp,
  render,
  screen,
  waitFor,
  fireEvent,
} from '../../setupTest';
import { CoursewareSearch } from './index';
import { useElementBoundingBox, useLockScroll, useCoursewareSearchParams } from './hooks';
import initializeStore from '../../store';
import { searchCourseContent } from '../data/thunks';
import { setShowSearch } from '../data/slice';
import { updateModel, useModel } from '../../generic/model-store';

jest.mock('./hooks');
jest.mock('../../generic/model-store', () => ({
  updateModel: jest.fn(),
  useModel: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackingLogEvent: jest.fn(),
}));

jest.mock('../data/thunks', () => ({
  searchCourseContent: jest.fn(),
}));

jest.mock('../data/slice', () => ({
  setShowSearch: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const decodedCourseId = 'course-v1:edX+DemoX+Demo_Course';
const decodedSequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction';
const decodedUnitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const pathname = `/course/${decodedCourseId}/${decodedSequenceId}/${decodedUnitId}`;

const tabsTopPosition = 128;

const defaultProps = {
  org: 'edX',
  loading: false,
  searchKeyword: '',
  errors: undefined,
  total: 0,
};

const coursewareSearch = {
  query: '',
  filter: '',
  setQuery: jest.fn(),
  setFilter: jest.fn(),
  clearSearchParams: jest.fn(),
};

const intl = {
  formatMessage: (message) => message?.defaultMessage || '',
};

function renderComponent(props = {}) {
  const store = initializeStore();
  history.push(pathname);
  const { container } = render(
    <AppProvider store={store}>
      <Routes>
        <Route path="/course/:courseId/:sequenceId/:unitId" element={<CoursewareSearch intl={intl} {...props} />} />
      </Routes>
    </AppProvider>,
  );
  return container;
}

const mockModels = ((props = defaultProps) => {
  useModel.mockReturnValue({
    ...defaultProps,
    ...props,
  });

  updateModel.mockReturnValue({
    type: 'MOCK_ACTION',
    payload: {
      modelType: 'contentSearchResults',
      model: defaultProps,
    },
  });
});

const mockSearchParams = ((props = coursewareSearch) => {
  useCoursewareSearchParams.mockReturnValue(props);
});

describe('CoursewareSearch', () => {
  beforeAll(initializeMockApp);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when rendering normally', () => {
    beforeAll(() => {
      useElementBoundingBox.mockImplementation(() => ({ top: tabsTopPosition }));
    });

    it('should use useElementBoundingBox() and useLockScroll() hooks', () => {
      mockModels();
      mockSearchParams();
      renderComponent();

      expect(useElementBoundingBox).toBeCalledTimes(1);
      expect(useLockScroll).toBeCalledTimes(1);
    });

    it('should have a "--modal-top-position" CSS variable matching the CourseTabsNavigation top position', () => {
      mockModels();
      mockSearchParams();
      renderComponent();

      const section = screen.getByTestId('courseware-search-section');
      expect(section.style.getPropertyValue('--modal-top-position')).toBe(`${tabsTopPosition}px`);
    });
  });

  describe('when clicking on the "Close" button', () => {
    it('should dispatch setShowSearch(false)', async () => {
      mockModels();
      renderComponent();

      await waitFor(() => {
        const close = screen.queryByTestId('courseware-search-close-button');
        fireEvent.click(close);
      });

      expect(setShowSearch).toBeCalledWith(false);
    });
  });

  describe('when CourseTabsNavigation is not present', () => {
    it('should use "--modal-top-position: 0" if  nce element is not present', () => {
      useElementBoundingBox.mockImplementation(() => undefined);

      mockModels();
      mockSearchParams();
      renderComponent();

      const section = screen.getByTestId('courseware-search-section');
      expect(section.style.getPropertyValue('--modal-top-position')).toBe('0');
    });
  });

  describe('when passing extra props', () => {
    it('should pass on extra props to section element', () => {
      mockModels();
      mockSearchParams();
      renderComponent({ foo: 'bar' });

      const section = screen.getByTestId('courseware-search-section');
      expect(section).toHaveAttribute('foo', 'bar');
    });
  });

  describe('when submitting an empty search', () => {
    it('should clear the search by dispatch updateModel', async () => {
      mockModels();
      renderComponent();

      await waitFor(() => {
        const submit = screen.queryByTestId('courseware-search-form-submit');
        fireEvent.click(submit);
      });

      expect(updateModel).toHaveBeenCalledWith({
        modelType: 'contentSearchResults',
        model: {
          id: decodedCourseId,
          searchKeyword: '',
          results: [],
          errors: undefined,
          loading: false,
        },
      });
    });
  });

  describe('when submitting a search', () => {
    it('should show a loading state', () => {
      mockModels({
        loading: true,
      });
      renderComponent();

      expect(screen.queryByTestId('courseware-search-spinner')).toBeInTheDocument();
    });

    it('should call searchCourseContent', async () => {
      mockModels();
      renderComponent();

      const searchKeyword = 'course';

      await waitFor(() => {
        const input = screen.queryByTestId('courseware-search-form').querySelector('input');
        fireEvent.change(input, { target: { value: searchKeyword } });
      });

      await waitFor(() => {
        const submit = screen.queryByTestId('courseware-search-form-submit');
        fireEvent.click(submit);
      });

      expect(sendTrackingLogEvent).toHaveBeenCalledWith('edx.course.home.courseware_search.submit', {
        org_key: defaultProps.org,
        courserun_key: decodedCourseId,
        event_type: 'searchKeyword',
        keyword: searchKeyword,
      });
      expect(searchCourseContent).toHaveBeenCalledWith(decodedCourseId, searchKeyword);
    });

    it('should show an error state if any', () => {
      mockModels({
        errors: ['foo'],
      });
      renderComponent();

      expect(screen.queryByTestId('courseware-search-error')).toBeInTheDocument();
    });

    it('should not show a summary if there are no results', () => {
      mockModels({
        searchKeyword: 'test',
        total: 0,
      });
      renderComponent();

      expect(screen.queryByTestId('courseware-search-summary')).not.toBeInTheDocument();
    });

    it('should show a summary for the results', () => {
      mockModels({
        searchKeyword: 'fubar',
        total: 1,
      });
      renderComponent();

      expect(screen.queryByTestId('courseware-search-summary').textContent).toBe('Results for "fubar":');
    });
  });

  describe('when clearing the search input', () => {
    it('should clear the search by dispatch updateModel', async () => {
      mockModels({
        searchKeyword: 'fubar',
        total: 2,
      });
      renderComponent();

      await waitFor(() => {
        const input = screen.queryByTestId('courseware-search-form').querySelector('input');
        fireEvent.change(input, { target: { value: '' } });
      });

      expect(updateModel).toHaveBeenCalledWith({
        modelType: 'contentSearchResults',
        model: {
          id: decodedCourseId,
          searchKeyword: '',
          results: [],
          errors: undefined,
          loading: false,
        },
      });
    });
  });
});

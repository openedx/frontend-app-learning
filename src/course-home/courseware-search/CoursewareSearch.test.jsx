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
  within,
} from '../../setupTest';
import { CoursewareSearch } from './index';
import {
  useCoursewareSearchFeatureFlag, useElementBoundingBox, useLockScroll, useCoursewareSearchParams,
} from './hooks';
import { useCoursewareSearch } from './CoursewareSearchContext';
import { useCoursewareSearchResults } from './data/apiHooks';
import initializeStore from '../../store';
import { useModel } from '../../generic/model-store';

jest.mock('./hooks');
jest.mock('./CoursewareSearchContext');
jest.mock('./data/apiHooks');
jest.mock('../../generic/model-store', () => ({
  ...jest.requireActual('../../generic/model-store'),
  useModel: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackingLogEvent: jest.fn(),
}));

const decodedCourseId = 'course-v1:edX+DemoX+Demo_Course';
const decodedSequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction';
const decodedUnitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const pathname = `/course/${decodedCourseId}/${decodedSequenceId}/${decodedUnitId}`;

const tabsTopPosition = 128;

const org = 'edX';
const mockClose = jest.fn();

const defaultSearchParams = {
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

const mockResults = ({ data, isLoading = false, isError = false } = {}) => {
  useCoursewareSearchResults.mockReturnValue({ data, isLoading, isError });
};

const mockSearchParams = ((params) => {
  const props = { ...defaultSearchParams, ...params };
  useCoursewareSearchParams.mockReturnValue(props);
});

describe('CoursewareSearch', () => {
  beforeAll(() => initializeMockApp());

  beforeEach(() => {
    useModel.mockReturnValue({ org });
    useCoursewareSearchFeatureFlag.mockReturnValue(true);
    useCoursewareSearch.mockReturnValue({ show: true, close: mockClose });
    mockResults();
    mockSearchParams();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when rendering normally', () => {
    beforeAll(() => {
      useElementBoundingBox.mockImplementation(() => ({ top: tabsTopPosition }));
    });

    it('should use useElementBoundingBox() and useLockScroll() hooks', () => {
      renderComponent();

      expect(useElementBoundingBox).toHaveBeenCalledTimes(1);
      expect(useLockScroll).toHaveBeenCalledTimes(1);
    });

    it('should have a "--modal-top-position" CSS variable matching the CourseTabsNavigation top position', () => {
      renderComponent();

      const section = screen.getByTestId('courseware-search-dialog');
      expect(section.style.getPropertyValue('--modal-top-position')).toBe(`${tabsTopPosition}px`);
    });
  });

  describe('when clicking on the "Close" button', () => {
    it('should close the dialog', async () => {
      renderComponent();

      await waitFor(() => {
        const close = screen.queryByTestId('courseware-search-close-button');
        fireEvent.click(close);
      });

      expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('when CourseTabsNavigation is not present', () => {
    it('should use "--modal-top-position: 0" if  nce element is not present', () => {
      useElementBoundingBox.mockImplementation(() => undefined);

      renderComponent();

      const section = screen.getByTestId('courseware-search-dialog');
      expect(section.style.getPropertyValue('--modal-top-position')).toBe('0');
    });
  });

  describe('when passing extra props', () => {
    it('should pass on extra props to section element', () => {
      renderComponent({ foo: 'bar' });

      const section = screen.getByTestId('courseware-search-dialog');
      expect(section).toHaveAttribute('foo', 'bar');
    });
  });

  describe('when submitting an empty search', () => {
    it('should clear the search params', async () => {
      renderComponent();

      await waitFor(() => {
        const submit = screen.queryByTestId('courseware-search-form-submit');
        fireEvent.click(submit);
      });

      expect(defaultSearchParams.clearSearchParams).toHaveBeenCalled();
    });
  });

  describe('when submitting a search', () => {
    it('should show a loading state', () => {
      mockResults({ isLoading: true });
      renderComponent();

      expect(screen.queryByTestId('courseware-search-spinner')).toBeInTheDocument();
    });

    it('should update the search query on submit', async () => {
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
        org_key: org,
        courserun_key: decodedCourseId,
        event_type: 'searchKeyword',
        keyword: searchKeyword,
      });
      expect(defaultSearchParams.setQuery).toHaveBeenCalledWith(searchKeyword);
    });

    it('should show an error state if any', () => {
      mockResults({ isError: true });
      renderComponent();

      expect(screen.queryByTestId('courseware-search-error')).toBeInTheDocument();
    });

    it('should not show a summary if there are no results', () => {
      mockResults({ data: { total: 0 } });
      renderComponent();

      expect(screen.queryByTestId('courseware-search-summary')).not.toBeInTheDocument();
    });

    it('should show a summary for the results within a container with aria-live="polite"', () => {
      mockSearchParams({ query: 'fubar' });
      mockResults({ data: { total: 1 } });
      renderComponent();

      const results = screen.queryByTestId('courseware-search-results');

      expect(results).toHaveAttribute('aria-live', 'polite');
      expect(within(results).queryByTestId('courseware-search-summary').textContent).toBe('Results for "fubar":');
    });
  });

  describe('when clearing the search input', () => {
    it('should clear the search params', async () => {
      mockSearchParams({ query: 'fubar' });
      mockResults({ data: { total: 2 } });
      renderComponent();

      await waitFor(() => {
        const input = screen.queryByTestId('courseware-search-form').querySelector('input');
        fireEvent.change(input, { target: { value: '' } });
      });

      expect(defaultSearchParams.clearSearchParams).toHaveBeenCalled();
    });
  });
});

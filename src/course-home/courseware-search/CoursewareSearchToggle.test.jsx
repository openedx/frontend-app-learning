import React from 'react';
import {
  act,
  fireEvent,
  initializeMockApp,
  render,
  screen,
  waitFor,
} from '../../setupTest';
import { CoursewareSearchToggle } from './index';
import { useCoursewareSearchFeatureFlag } from './hooks';
import { useCoursewareSearch } from './CoursewareSearchContext';

const mockOpen = jest.fn();
const mockCoursewareSearchParams = jest.fn();

jest.mock('./CoursewareSearchContext');

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useCoursewareSearchParams: () => mockCoursewareSearchParams,
  useCoursewareSearchFeatureFlag: jest.fn(),
}));

const coursewareSearch = {
  query: '',
  filter: '',
  setQuery: jest.fn(),
  setFilter: jest.fn(),
  clearSearchParams: jest.fn(),
};

const mockSearchParams = ((props = coursewareSearch) => {
  mockCoursewareSearchParams.mockReturnValue(props);
});

function renderComponent() {
  const { container } = render(<CoursewareSearchToggle />);
  return container;
}

describe('CoursewareSearchToggle', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  beforeEach(() => {
    useCoursewareSearch.mockReturnValue({ show: false, open: mockOpen, close: jest.fn() });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should not render when the waffle flag is disabled', async () => {
    useCoursewareSearchFeatureFlag.mockReturnValue(false);
    mockSearchParams();

    await act(async () => renderComponent());
    await waitFor(() => {
      expect(useCoursewareSearchFeatureFlag).toHaveBeenCalled();
      expect(screen.queryByTestId('courseware-search-open-button')).not.toBeInTheDocument();
    });
  });

  it('Should render when the waffle flag is enabled', async () => {
    useCoursewareSearchFeatureFlag.mockReturnValue(true);
    mockSearchParams();

    await act(async () => renderComponent());

    await waitFor(() => {
      expect(useCoursewareSearchFeatureFlag).toHaveBeenCalled();
      expect(screen.queryByTestId('courseware-search-open-button')).toBeInTheDocument();
    });
  });

  it('Should open search when clicking the search button', async () => {
    useCoursewareSearchFeatureFlag.mockReturnValue(true);
    mockSearchParams();

    await act(async () => renderComponent());
    const button = await screen.findByTestId('courseware-search-open-button');
    fireEvent.click(button);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});

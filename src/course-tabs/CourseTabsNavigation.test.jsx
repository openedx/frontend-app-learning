import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  initializeMockApp, render, screen,
} from '../setupTest';
import { useCoursewareSearchState, useCoursewareSearchParams } from '../course-home/courseware-search/hooks';
import { CourseTabsNavigation } from './index';
import initializeStore from '../store';

jest.mock('../course-home/courseware-search/hooks');

const mockDispatch = jest.fn();
const coursewareSearch = {
  query: '',
  filter: '',
  setQuery: jest.fn(),
  setFilter: jest.fn(),
  clearSearchParams: jest.fn(),
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

function renderComponent(props = { tabs: [] }) {
  const store = initializeStore();
  const { container } = render(
    <AppProvider store={store}>
      <CourseTabsNavigation {...props} />
    </AppProvider>,
  );
  return container;
}

describe('Course Tabs Navigation', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  beforeEach(() => {
    useCoursewareSearchState.mockImplementation(() => ({ show: false }));
    useCoursewareSearchParams.mockReturnValue(coursewareSearch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without tabs', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: 'More...' })).toBeInTheDocument();
  });

  it('renders with tabs', () => {
    const tabs = [
      { url: 'http://test-url1', title: 'Item 1', slug: 'test1' },
      { url: 'http://test-url2', title: 'Item 2', slug: 'test2' },
    ];
    const mockData = {
      tabs,
      activeTabSlug: tabs[0].slug,
    };
    renderComponent(mockData);

    expect(screen.getByRole('link', { name: tabs[0].title })).toHaveAttribute('href', tabs[0].url);
    expect(screen.getByRole('link', { name: tabs[0].title })).toHaveClass('active');

    expect(screen.getByRole('link', { name: tabs[1].title })).toHaveAttribute('href', tabs[1].url);
    expect(screen.getByRole('link', { name: tabs[1].title })).not.toHaveClass('active');
  });

  it('should NOT render CoursewareSearch if the flag is off', () => {
    renderComponent();

    expect(screen.queryByTestId('courseware-search-section')).not.toBeInTheDocument();
  });

  it('should render CoursewareSearch if the flag is on', () => {
    useCoursewareSearchState.mockImplementation(() => ({ show: true }));
    renderComponent();

    expect(screen.queryByTestId('courseware-search-section')).toBeInTheDocument();
  });
});

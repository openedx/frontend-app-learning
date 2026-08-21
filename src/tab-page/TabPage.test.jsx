import React from 'react';
import {
  initializeTestStore, render, screen,
} from '../setupTest';
import { TabPage } from './index';
import { useToast } from '../generic/ToastContext';
import { addModel } from '../generic/model-store';

// We should not test `LoadedTabPage` page here, as `TabPage` is used only for passing `passthroughProps`.
jest.mock('./LoadedTabPage', () => function () {
  return <div data-testid="LoadedTabPage" />;
});

jest.mock('../product-tours/newUserCourseHomeTour/LaunchCourseHomeTourButton', () => function () {
  return <div data-testid="sr-tour-button" />;
});

jest.mock('../generic/ToastContext', () => ({
  ...jest.requireActual('../generic/ToastContext'),
  useToast: jest.fn(),
}));

const mockUseToast = (overrides = {}) => useToast.mockReturnValue({
  toastContent: null,
  isToastOpen: false,
  closeToast: jest.fn(),
  ...overrides,
});

describe('Tab Page', () => {
  const mockData = {
    courseId: 'test-course',
    courseStatus: 'loaded',
  };

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  beforeEach(() => {
    mockUseToast();
  });

  it('displays loading message', () => {
    render(<TabPage {...mockData} courseStatus="loading" />, { wrapWithRouter: true });
    expect(screen.getByText('Loading course page…')).toBeInTheDocument();
  });

  it('displays loading failure message', () => {
    render(<TabPage {...mockData} courseStatus="other" />, { wrapWithRouter: true });
    expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
  });

  it('displays custom error message from courseHome state when available', async () => {
    const customErrorMessage = 'This course is not currently accessible. The course team has restricted access to this content.';
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    // Manually dispatch a failure with the custom error message
    testStore.dispatch({
      type: 'course-home/fetchTabFailure',
      payload: { courseId: 'test-course', errorMessage: customErrorMessage, errorCode: 'not_visible_in_catalog' },
    });
    render(<TabPage {...mockData} courseStatus="failed" />, { store: testStore, wrapWithRouter: true });
    expect(screen.getByText(customErrorMessage)).toBeInTheDocument();
    expect(screen.queryByText('There was an error loading this course.')).not.toBeInTheDocument();
  });

  it('displays custom error message from courseware state when available', async () => {
    const customErrorMessage = 'This course is not currently accessible. The course team has restricted access to this content.';
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    // Manually dispatch a courseware failure with the custom error message
    testStore.dispatch({
      type: 'courseware/fetchCourseFailure',
      payload: { courseId: 'test-course', errorMessage: customErrorMessage, errorCode: 'not_visible_in_catalog' },
    });
    render(<TabPage {...mockData} courseStatus="failed" />, { store: testStore, wrapWithRouter: true });
    expect(screen.getByText(customErrorMessage)).toBeInTheDocument();
    expect(screen.queryByText('There was an error loading this course.')).not.toBeInTheDocument();
  });

  it('displays generic error message when no custom error message is available', async () => {
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    testStore.dispatch({
      type: 'course-home/fetchTabFailure',
      payload: { courseId: 'test-course' },
    });
    render(<TabPage {...mockData} courseStatus="failed" />, { store: testStore, wrapWithRouter: true });
    expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
  });

  it('renders a toast from the toast context', () => {
    mockUseToast({
      toastContent: { message: 'test-toast-header', action: { label: 'test-toast-body', href: 'test-toast-link' } },
      isToastOpen: true,
    });
    render(<TabPage {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByText('test-toast-header')).toBeInTheDocument();
    expect(screen.getByText('test-toast-body')).toBeInTheDocument();
  });

  it('displays Loaded Tab Page', () => {
    render(<TabPage {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByTestId('LoadedTabPage')).toBeInTheDocument();
  });

  it('renders the screen-reader tour button on the outline tab', () => {
    render(<TabPage {...mockData} activeTabSlug="outline" />, { wrapWithRouter: true });
    expect(screen.getByTestId('sr-tour-button')).toBeInTheDocument();
  });

  it('does not render the tour button on other tabs', () => {
    render(<TabPage {...mockData} activeTabSlug="dates" />, { wrapWithRouter: true });
    expect(screen.queryByTestId('sr-tour-button')).not.toBeInTheDocument();
  });

  describe('React Query courseStatus', () => {
    const metaWithAccess = { data: { courseAccess: { hasAccess: true } } };

    it('renders the Loaded Tab Page when both queries resolve with access', () => {
      render(
        <TabPage {...mockData} courseStatus={{ metadataQuery: metaWithAccess, tabDataQuery: {} }} />,
        { wrapWithRouter: true },
      );
      expect(screen.getByTestId('LoadedTabPage')).toBeInTheDocument();
    });

    it('displays loading while the metadata query is loading', () => {
      render(
        <TabPage {...mockData} courseStatus={{ metadataQuery: { isPending: true }, tabDataQuery: {} }} />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText('Loading course page…')).toBeInTheDocument();
    });

    it('displays loading while the tab-data query is loading', () => {
      render(
        <TabPage {...mockData} courseStatus={{ metadataQuery: metaWithAccess, tabDataQuery: { isPending: true } }} />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText('Loading course page…')).toBeInTheDocument();
    });

    it('displays the error message when the metadata query fails', () => {
      render(
        <TabPage {...mockData} courseStatus={{ metadataQuery: { isError: true }, tabDataQuery: {} }} />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
    });

    it('displays the error message when the tab-data query fails', () => {
      render(
        <TabPage {...mockData} courseStatus={{ metadataQuery: metaWithAccess, tabDataQuery: { isError: true } }} />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
    });

    it('renders no tab content when courseId is missing', () => {
      render(
        <TabPage
          {...mockData}
          courseId={undefined}
          courseStatus={{ metadataQuery: metaWithAccess, tabDataQuery: {} }}
        />,
        { wrapWithRouter: true },
      );
      expect(screen.queryByTestId('LoadedTabPage')).not.toBeInTheDocument();
    });

    it('does not render tab content when access is denied', async () => {
      const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
      testStore.dispatch(addModel({
        modelType: 'courseHomeMeta',
        model: { id: 'test-course', courseAccess: { hasAccess: false } },
      }));
      render(
        <TabPage
          {...mockData}
          activeTabSlug="dates"
          courseStatus={{ metadataQuery: { data: { courseAccess: { hasAccess: false } } }, tabDataQuery: {} }}
        />,
        { store: testStore, wrapWithRouter: true },
      );
      expect(screen.queryByTestId('LoadedTabPage')).not.toBeInTheDocument();
    });
  });
});

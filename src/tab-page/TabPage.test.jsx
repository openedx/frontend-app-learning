import React from 'react';
import {
  mockCourseRequests, render, screen,
} from '../setupTest';
import { TabPage } from './index';
import { useToast } from '../generic/ToastContext';

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
  const metaWithAccess = { data: { courseAccess: { hasAccess: true } } };
  const mockData = {
    courseId: 'test-course',
    courseStatus: { metadataQuery: metaWithAccess },
  };

  beforeAll(async () => {
    mockCourseRequests();
  });

  beforeEach(() => {
    mockUseToast();
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

    describe('with several tab-data queries', () => {
      const forbidden = (detail) => ({
        isError: true,
        error: { response: { status: 403, data: { detail } } },
      });

      it('renders the Loaded Tab Page when every tab-data query resolves', () => {
        render(
          <TabPage {...mockData} courseStatus={{ metadataQuery: metaWithAccess, tabDataQueries: [{}, {}] }} />,
          { wrapWithRouter: true },
        );
        expect(screen.getByTestId('LoadedTabPage')).toBeInTheDocument();
      });

      it('displays loading while any tab-data query is loading', () => {
        render(
          <TabPage
            {...mockData}
            courseStatus={{ metadataQuery: metaWithAccess, tabDataQueries: [{}, { isPending: true }] }}
          />,
          { wrapWithRouter: true },
        );
        expect(screen.getByText('Loading course page…')).toBeInTheDocument();
      });

      it('displays the 403 detail of every failed tab-data query', () => {
        render(
          <TabPage
            {...mockData}
            courseStatus={{
              metadataQuery: metaWithAccess,
              tabDataQueries: [forbidden('The first detail.'), forbidden('The second detail.')],
            }}
          />,
          { wrapWithRouter: true },
        );
        expect(screen.getByText('The first detail.')).toBeInTheDocument();
        expect(screen.getByText('The second detail.')).toBeInTheDocument();
      });

      it('displays a detail shared by several failed tab-data queries once', () => {
        render(
          <TabPage
            {...mockData}
            courseStatus={{
              metadataQuery: metaWithAccess,
              tabDataQueries: [forbidden('The same detail.'), forbidden('The same detail.')],
            }}
          />,
          { wrapWithRouter: true },
        );
        expect(screen.getAllByText('The same detail.')).toHaveLength(1);
      });
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

    it('displays the 403 detail from the metadata query error', () => {
      const detail = 'This course is not currently accessible to you.';
      render(
        <TabPage
          {...mockData}
          courseStatus={{
            metadataQuery: {
              isError: true,
              error: { response: { status: 403, data: { detail, error_code: 'course_access_redirect' } } },
            },
            tabDataQuery: {},
          }}
        />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText(detail)).toBeInTheDocument();
      expect(screen.queryByText('There was an error loading this course.')).not.toBeInTheDocument();
    });

    it('displays the 403 detail from the tab-data query error', () => {
      const detail = 'Progress data is not available for this learner.';
      render(
        <TabPage
          {...mockData}
          courseStatus={{
            metadataQuery: metaWithAccess,
            tabDataQuery: {
              isError: true,
              error: { response: { status: 403, data: { detail } } },
            },
          }}
        />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText(detail)).toBeInTheDocument();
      expect(screen.queryByText('There was an error loading this course.')).not.toBeInTheDocument();
    });

    it('displays the generic message for a non-403 metadata error', () => {
      render(
        <TabPage
          {...mockData}
          courseStatus={{
            metadataQuery: { isError: true, error: { response: { status: 500 } } },
            tabDataQuery: {},
          }}
        />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
    });

    it('displays the generic message for a 403 without a body', () => {
      render(
        <TabPage
          {...mockData}
          courseStatus={{
            metadataQuery: { isError: true, error: { response: { status: 403 } } },
            tabDataQuery: {},
          }}
        />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
    });

    it('shows loading when access is denied but the tab-data query is still pending', () => {
      render(
        <TabPage
          {...mockData}
          activeTabSlug="outline"
          courseStatus={{
            metadataQuery: { data: { courseAccess: { hasAccess: false } } },
            tabDataQuery: { isPending: true },
          }}
        />,
        { wrapWithRouter: true },
      );
      expect(screen.getByText('Loading course page…')).toBeInTheDocument();
      expect(screen.queryByTestId('LoadedTabPage')).not.toBeInTheDocument();
    });

    it('does not render tab content when access is denied', () => {
      render(
        <TabPage
          {...mockData}
          activeTabSlug="dates"
          courseStatus={{ metadataQuery: { data: { courseAccess: { hasAccess: false } } }, tabDataQuery: {} }}
        />,
        { wrapWithRouter: true },
      );
      expect(screen.queryByTestId('LoadedTabPage')).not.toBeInTheDocument();
    });
  });
});

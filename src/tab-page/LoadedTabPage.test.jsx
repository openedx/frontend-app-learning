import React from 'react';
import { Factory } from 'rosie';
import { camelCaseObject } from '@edx/frontend-platform';
import { getLoggingService } from '@edx/frontend-platform/logging';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  act, createTestQueryClient, mockCourseRequests, render, screen, seedQueryData,
} from '../setupTest';
import { courseHomeQueryKeys } from '../course-home/data/queryKeys';
import LoadedTabPage from './LoadedTabPage';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('../course-tabs/CourseTabsNavigation', () => function () {
  return <nav aria-label="Course tabs" />;
});
jest.mock('../instructor-toolbar/InstructorToolbar', () => function () {
  return <div data-testid="InstructorToolbar" />;
});
jest.mock('../product-tours/ProductTours', () => function () {
  return <div data-testid="ProductTours" />;
});

describe('Loaded Tab Page', () => {
  const mockData = { activeTabSlug: 'courseware' };

  function renderWithMetadata(courseHomeMetadata) {
    const queryClient = createTestQueryClient();
    seedQueryData(
      queryClient,
      courseHomeQueryKeys.metadata(courseHomeMetadata.id),
      camelCaseObject(courseHomeMetadata),
    );
    return render(
      <QueryClientProvider client={queryClient}>
        <LoadedTabPage {...mockData} courseId={courseHomeMetadata.id} />
      </QueryClientProvider>,
    );
  }

  beforeAll(async () => {
    mockCourseRequests();
  });

  it('renders correctly', () => {
    renderWithMetadata(Factory.build('courseHomeMetadata'));

    expect(screen.getByRole('navigation', { name: /course tabs/i })).toBeInTheDocument();
    expect(screen.queryByTestId('InstructorToolbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows Instructor Toolbar if original user is staff', () => {
    renderWithMetadata(Factory.build('courseHomeMetadata', { original_user_is_staff: true }));

    expect(screen.getByTestId('InstructorToolbar')).toBeInTheDocument();
  });

  it('shows streak celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { streak_length_to_celebrate: 3 } });
    await act(async () => renderWithMetadata(courseHomeMetadata));
    expect(screen.getByRole('dialog')).toHaveTextContent('3 day streak');
  });

  it('throws when rendered before the course metadata has loaded', () => {
    // jsdom reports the caught render error on console.error; silence it, not the assertion.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <LoadedTabPage {...mockData} courseId="course-v1:edX+DemoX+Demo_Course" />
      </QueryClientProvider>,
    );

    expect(getLoggingService().logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'LoadedTabPage rendered without course metadata for course-v1:edX+DemoX+Demo_Course',
      }),
      expect.anything(),
    );

    consoleError.mockRestore();
  });

  describe('landmark structure', () => {
    it('for the courseware tab, does not render a <main> wrapper here (Sequence renders <main id="main-content"> instead)', () => {
      render(<LoadedTabPage {...mockData} activeTabSlug="courseware" />);

      // No <main> is emitted from LoadedTabPage — the courseware Sequence provides it.
      expect(document.querySelector('main')).not.toBeInTheDocument();
      // #main-content id is deferred to Sequence's <main>, not on the container div here.
      expect(document.getElementById('main-content')).not.toBeInTheDocument();
    });

    it('for non-courseware tabs, the <main id="main-content"> landmark wraps only the page children, not the alerts or tab navigation', () => {
      render(
        <LoadedTabPage {...mockData} activeTabSlug="outline">
          <button type="button">Tab content</button>
        </LoadedTabPage>,
      );

      const mainLandmark = screen.getByRole('main');

      // The <main> landmark and the #main-content container are the same element.
      expect(mainLandmark).toBe(document.getElementById('main-content'));

      // It wraps the page children...
      expect(mainLandmark).toContainElement(screen.getByRole('button', { name: /tab content/i }));

      // ...but not the tab navigation, which sits outside the landmark.
      expect(mainLandmark).not.toContainElement(screen.getByRole('navigation', { name: /course tabs/i }));
    });
  });
});

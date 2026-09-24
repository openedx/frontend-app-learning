import React from 'react';
import { Factory } from 'rosie';
import { camelCaseObject } from '@edx/frontend-platform';
import { getLoggingService } from '@edx/frontend-platform/logging';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  act, createTestQueryClient, initializeTestStore, render, screen, seedQueryData,
} from '../setupTest';
import { courseHomeQueryKeys } from '../course-home/data/queryKeys';
import LoadedTabPage from './LoadedTabPage';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('../course-tabs/CourseTabsNavigation', () => function () {
  return <div data-testid="CourseTabsNavigation" />;
});
jest.mock('../instructor-toolbar/InstructorToolbar', () => function () {
  return <div data-testid="InstructorToolbar" />;
});
jest.mock('../product-tours/ProductTours', () => function () {
  return <div data-testid="ProductTours" />;
});

describe('Loaded Tab Page', () => {
  const mockData = { activeTabSlug: 'courseware' };

  function renderWithMetadata(courseHomeMetadata, { store } = {}) {
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
      { store },
    );
  }

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchSequence: true });
  });

  it('renders correctly', () => {
    renderWithMetadata(Factory.build('courseHomeMetadata'));

    expect(screen.queryByTestId('CourseTabsNavigation')).toBeInTheDocument();
    expect(screen.queryByTestId('InstructorToolbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows Instructor Toolbar if original user is staff', () => {
    renderWithMetadata(Factory.build('courseHomeMetadata', { original_user_is_staff: true }));

    expect(screen.getByTestId('InstructorToolbar')).toBeInTheDocument();
  });

  it('shows streak celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { streak_length_to_celebrate: 3 } });
    const testStore = await initializeTestStore({ courseHomeMetadata }, false);
    await act(async () => renderWithMetadata(courseHomeMetadata, { store: testStore }));
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
});

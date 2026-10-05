import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';
import { QueryClientProvider } from '@tanstack/react-query';

import {
  authenticatedUser, createTestQueryClient, fireEvent, initializeMockApp, mockCourseRequests, render,
  screen, seedQueryData, waitFor,
} from '../../../../setupTest';
import { getCourseHomeCourseMetadata } from '../../../../course-home/data/api';
import { courseHomeQueryKeys } from '../../../../course-home/data/queryKeys';
import HonorCode from './HonorCode';

const mockNavigate = jest.fn();

initializeMockApp();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Honor Code', () => {
  let axiosMock;
  let courseHomeMeta;
  let honorCodePostUrl;
  const mockData = {};

  async function setupCourse(courseHomeMetaOptions) {
    if (courseHomeMetaOptions) {
      const courseHomeMetadata = Factory.build('courseHomeMetadata', courseHomeMetaOptions);
      mockData.courseId = mockCourseRequests({ courseHomeMetadata }).courseId;
    } else {
      mockData.courseId = mockCourseRequests().courseId;
    }
    courseHomeMeta = await getCourseHomeCourseMetadata(mockData.courseId);
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    honorCodePostUrl = `${getConfig().LMS_BASE_URL}/api/agreements/v1/integrity_signature/${mockData.courseId}`;
  }

  // The suite's own axios adapter replaces the one mocking the metadata endpoint, so the component
  // reads the course metadata, fetched before the swap, from a seeded query rather than a mounted fetch.
  function renderHonorCode() {
    const queryClient = createTestQueryClient();
    seedQueryData(
      queryClient,
      courseHomeQueryKeys.metadata(mockData.courseId),
      courseHomeMeta,
    );
    return render(
      <QueryClientProvider client={queryClient}>
        <HonorCode {...mockData} />
      </QueryClientProvider>,
      { wrapWithRouter: true },
    );
  }

  it('cancel button links to course home ', async () => {
    await setupCourse();
    renderHonorCode();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledWith(`/course/${mockData.courseId}/home`);
  });

  it('calls to save integrity_signature when agreeing', async () => {
    await setupCourse({ username: authenticatedUser.username });
    renderHonorCode();
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(honorCodePostUrl);
    });
  });

  it('still calls to save integrity_signature if masquerading', async () => {
    await setupCourse(
      {
        is_staff: false,
        original_user_is_staff: true,
        username: authenticatedUser.username,
      },
    );
    renderHonorCode();
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(honorCodePostUrl);
    });
  });

  it('will not call to save integrity_signature if masquerading a specific student', async () => {
    await setupCourse(
      {
        is_staff: false,
        original_user_is_staff: true,
        username: 'otheruser',
      },
    );
    renderHonorCode();
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
    });
  });

  afterEach(async () => {
    axiosMock.resetHistory();
  });
});

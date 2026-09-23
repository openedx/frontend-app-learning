import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { QueryClientProvider } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import userEvent from '@testing-library/user-event';
import {
  createTestQueryClient, initializeTestStore, render, screen, seedQueryData, waitFor,
} from '../../setupTest';
import { courseHomeQueryKeys } from '../../course-home/data/queryKeys';
import EnrollmentAlert from './EnrollmentAlert';

jest.mock('@edx/frontend-platform/analytics');

describe('EnrollmentAlert', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const enrollmentUrl = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  let axiosMock: MockAdapter;

  function renderAlert(payload = {}) {
    const queryClient = createTestQueryClient();
    seedQueryData(queryClient, courseHomeQueryKeys.metadata(courseId), { org: 'edX' });
    return render(
      <QueryClientProvider client={queryClient}>
        <EnrollmentAlert payload={{
          canEnroll: true, courseId, extraText: '', isStaff: false, ...payload,
        }}
        />
      </QueryClientProvider>,
    );
  }

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('tells a learner to enroll, with the enroll button', () => {
    renderAlert({ extraText: 'Enrollment closes soon.' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You must be enrolled in the course to see course content. Enrollment closes soon.',
    );
    expect(screen.getByRole('button', { name: 'Enroll now.' })).toBeInTheDocument();
  });

  it('tells staff they are not enrolled, without the enroll button', () => {
    renderAlert({ isStaff: true, canEnroll: false });

    expect(screen.getByRole('alert')).toHaveTextContent('You are viewing this course as staff, and are not enrolled.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('enrolls on click and reports the course org with the tracking event', async () => {
    axiosMock.onPost(enrollmentUrl).reply(200, {});
    // jsdom's location.reload is non-configurable, so swap the whole location for this test.
    const originalLocation = window.location;
    const reload = jest.fn();
    Object.defineProperty(window, 'location', { configurable: true, value: { reload } });
    try {
      renderAlert();
      await userEvent.click(screen.getByRole('button', { name: 'Enroll now.' }));

      await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ course_details: { course_id: courseId } }));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.course-home.enrollment', {
        org_key: 'edX',
        courserun_key: courseId,
      });
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    }
  });
});

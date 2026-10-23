import React from 'react';
import { getAuthenticatedHttpClient, getSiteConfig, getAnalyticsService } from '@openedx/frontend-base';
import MockAdapter from 'axios-mock-adapter';
import { QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { screen, waitFor } from '@testing-library/react';

import { mockLocation } from '@src/tests/location';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import EnrollmentAlert from './EnrollmentAlert';

describe('EnrollmentAlert', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const enrollmentUrl = `${getSiteConfig().lmsBaseUrl}/api/enrollment/v2/enrollment/`;
  let axiosMock: MockAdapter;

  function renderAlert(payload = {}) {
    const queryClient = createTestQueryClient();
    seedQueryData(queryClient, courseHomeMetaQuery(courseId).queryKey, { org: 'edX' });
    return render(
      <QueryClientProvider client={queryClient}>
        <EnrollmentAlert payload={{
          canEnroll: true, courseId, extraText: '', isStaff: false, ...payload,
        }}
        />
      </QueryClientProvider>,
    );
  }

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
    const { reload } = mockLocation({ reload: jest.fn() });
    renderAlert();
    await userEvent.click(screen.getByRole('button', { name: 'Enroll now.' }));

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ course_details: { course_id: courseId } }));
    expect(getAnalyticsService().sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.course-home.enrollment', {
      org_key: 'edX',
      courserun_key: courseId,
    });
  });
});

import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import OutlineTab from './OutlineTab';
import {
  fireEvent, initializeTestStore, render, screen, waitFor,
} from '../../setupTest';
import executeThunk from '../../utils';
import * as thunks from '../data/thunks';

jest.mock('@edx/frontend-platform/analytics');

describe('Outline Tab', () => {
  let store;
  let axiosMock;
  const courseMetadata = Factory.build('courseMetadata');
  const courseHomeMetadata = Factory.build(
    'courseHomeMetadata', {
      course_id: courseMetadata.id,
    },
    { courseTabs: courseMetadata.tabs },
  );
  const outlineTabData = Factory.build('outlineTabData', {
    courseId: courseMetadata.id,
    resume_course: {
      has_visited_course: false,
      url: `${getConfig().LMS_BASE_URL}/courses/${courseMetadata.id}/jump_to/block-v1:edX+Test+Block@12345abcde`,
    },
  });

  const outlineUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/v1/outline/*`);
  const courseMetadataUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/*`);

  beforeEach(async () => {
    store = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true, courseMetadata });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(outlineUrl).reply(200, outlineTabData);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
    axiosMock.onAny().reply((config) => {
      // eslint-disable-next-line no-console
      console.log(config.url);
      return [200, {}];
    });
    await executeThunk(thunks.fetchOutlineTab(courseMetadata.id), store.dispatch);
  });

  it('displays link to start course', () => {
    render(<OutlineTab />);
    expect(screen.getByRole('link', { name: 'Start Course' })).toBeInTheDocument();
  });

  it('displays link to resume course', async () => {
    const outlineTabDataCannotEnroll = Factory.build('outlineTabData', {
      courseId: courseMetadata.id,
      resume_course: {
        has_visited_course: true,
        url: `${getConfig().LMS_BASE_URL}/courses/${courseMetadata.id}/jump_to/block-v1:edX+Test+Block@12345abcde`,
      },
    });
    axiosMock.onGet(outlineUrl).reply(200, outlineTabDataCannotEnroll);
    await executeThunk(thunks.fetchOutlineTab(courseMetadata.id), store.dispatch);

    render(<OutlineTab />);

    expect(screen.getByRole('link', { name: 'Resume Course' })).toBeInTheDocument();
  });

  describe('Alert List', () => {
    describe('Enrollment Alert', () => {
      // FIXME: In certain conditions (e.g. when specifying a single `describe` group),
      //  running these tests is not deterministic - loading the alert may take a moment.
      //  It should be possible to avoid this by spying on `useEnrollClickHandler`.

      const extraText = outlineTabData.enroll_alert.extra_text;
      const alertMessage = `You must be enrolled in the course to see course content. ${extraText}`;
      const staffMessage = 'You are viewing this course as staff, and are not enrolled.';

      it('does not display enrollment alert for enrolled user', async () => {
        const courseHomeMetadataForEnrolledUser = Factory.build(
          'courseHomeMetadata', { course_id: courseMetadata.id, is_enrolled: true },
          { courseTabs: courseMetadata.tabs },
        );
        axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadataForEnrolledUser);
        await executeThunk(thunks.fetchOutlineTab(courseMetadata.id), store.dispatch);

        render(<OutlineTab />);

        await expect(waitFor(
          () => expect(screen.getByText(alertMessage)).toBeInTheDocument(),
          { timeout: 100 },
        )).rejects.toThrowError(`Unable to find an element with the text: ${alertMessage}`);
      });

      // FIXME: This is failing when using the common store.
      // it('does not display enrollment button if enrollment is not available', async () => {
      //   const outlineTabDataCannotEnroll = Factory.build('outlineTabData', {
      //     courseId: courseMetadata.id,
      //     enroll_alert: {
      //       can_enroll: false,
      //       extra_text: extraText,
      //     },
      //   });
      //   axiosMock.onGet(outlineUrl).reply(200, outlineTabDataCannotEnroll);
      //   await executeThunk(thunks.fetchOutlineTab(courseMetadata.id), store.dispatch);
      //
      //   render(<OutlineTab />);
      //
      //   await expect(waitFor(
      //     () => expect(screen.getByRole('button', { name: 'Enroll Now' })).toBeInTheDocument(),
      //     { timeout: 100 },
      //   )).rejects.toThrowError(/Unable to find role */);
      // });
      //
      // FIXME: This is failing when ran along two tests above.
      // it('displays enrollment alert for unenrolled user', async () => {
      //   render(<OutlineTab />);
      //
      //   const alert = await screen.findByText(alertMessage);
      //   expect(alert).toHaveAttribute('role', 'alert');
      //   expect(screen.queryByText(staffMessage)).not.toBeInTheDocument();
      //   expect(alert.parentElement.querySelector('svg')).toHaveClass('fa-exclamation-triangle');
      // });

      it('displays different message for unenrolled staff user', async () => {
        const courseHomeMetadataForEnrolledUser = Factory.build(
          'courseHomeMetadata', { course_id: courseMetadata.id, is_staff: true },
          { courseTabs: courseMetadata.tabs },
        );
        axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadataForEnrolledUser);
        await executeThunk(thunks.fetchOutlineTab(courseMetadata.id), store.dispatch);

        render(<OutlineTab />);

        const alert = await screen.findByText(staffMessage);
        expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
        expect(alert.parentElement.querySelector('svg')).toHaveClass('fa-info-circle');
      });

      it('handles button click', async () => {
        const enrollmentUrl = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`;
        axiosMock.reset();
        axiosMock.onPost(enrollmentUrl).reply(200, { });
        const { location } = window;
        delete window.location;
        window.location = {
          reload: jest.fn(),
        };
        render(<OutlineTab />);

        const button = await screen.findByRole('button', { name: 'Enroll Now' });
        fireEvent.click(button);
        await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
        expect(axiosMock.history.post[0].data)
          .toEqual(JSON.stringify({ course_details: { course_id: courseMetadata.id } }));
        expect(window.location.reload).toHaveBeenCalledTimes(1);

        window.location = location;
      });
    });

    // TODO: Test more alerts.
  });
});

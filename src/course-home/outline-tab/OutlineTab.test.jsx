import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import { ALERT_TYPES } from '../../generic/user-messages';
import buildSimpleCourseBlocks from '../data/__factories__/courseBlocks.factory';
import {
  fireEvent, initializeMockApp, logUnhandledRequests, render, screen, waitFor,
} from '../../setupTest';
import executeThunk from '../../utils';
import * as thunks from '../data/thunks';
import initializeStore from '../../store';
import OutlineTab from './OutlineTab';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('Outline Tab', () => {
  let axiosMock;

  const courseMetadataUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/*`);
  const goalUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/v1/save_course_goal`);
  const outlineUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/v1/outline/*`);

  const store = initializeStore();

  const courseMetadata = Factory.build('courseHomeMetadata');
  const { courseId } = courseMetadata;
  const outlineTabData = Factory.build('outlineTabData');

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
    axiosMock.onGet(outlineUrl).reply(200, outlineTabData);
    axiosMock.onPost(goalUrl).reply(200, { header: 'Success' });
    logUnhandledRequests(axiosMock);
    await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);
  });

  describe('Course Outline', () => {
    it('displays link to start course', () => {
      render(<OutlineTab />, { store });
      expect(screen.getByRole('link', { name: 'Start Course' })).toBeInTheDocument();
    });

    it('displays link to resume course', async () => {
      const outlineTabDataHasVisited = Factory.build('outlineTabData', {
        courseId,
        resume_course: {
          has_visited_course: true,
          url: `${getConfig().LMS_BASE_URL}/courses/${courseId}/jump_to/block-v1:edX+Test+Block@12345abcde`,
        },
      });
      axiosMock.onGet(outlineUrl).reply(200, outlineTabDataHasVisited);
      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      render(<OutlineTab />, { store });

      expect(screen.getByRole('link', { name: 'Resume Course' })).toBeInTheDocument();
    });

    it('expands section that contains resume block', async () => {
      const { courseBlocks } = await buildSimpleCourseBlocks(courseId, outlineTabData.title, { resumeBlock: true });
      const outlineTabDataResumeBlock = Factory.build('outlineTabData', {
        courseId,
        course_blocks: { blocks: courseBlocks.blocks },
      });
      axiosMock.onGet(outlineUrl).reply(200, outlineTabDataResumeBlock);
      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      render(<OutlineTab />, { store });
      const expandedSectionNode = screen.getByRole('button', { name: /Title of Section/ });
      expect(expandedSectionNode).toHaveAttribute('aria-expanded', 'true');
    });

    it('handles expand/collapse all button click', () => {
      render(<OutlineTab />, { store });
      // Button renders as "Expand All"
      const expandButton = screen.getByRole('button', { name: 'Expand All' });
      expect(expandButton).toBeInTheDocument();

      // Section initially renders collapsed
      const collapsedSectionNode = screen.getByRole('button', { name: /section/ });
      expect(collapsedSectionNode).toHaveAttribute('aria-expanded', 'false');

      // Click to expand section
      userEvent.click(expandButton);
      expect(collapsedSectionNode).toHaveAttribute('aria-expanded', 'true');

      // Click to collapse section
      userEvent.click(expandButton);
      expect(collapsedSectionNode).toHaveAttribute('aria-expanded', 'false');
    });

    it('displays correct icon for complete assignment', async () => {
      const { courseBlocks } = await buildSimpleCourseBlocks(courseId, outlineTabData.title, { complete: true });
      const outlineTabDataCompleteAssignment = Factory.build('outlineTabData', {
        courseId,
        course_blocks: { blocks: courseBlocks.blocks },
      });
      axiosMock.onGet(outlineUrl).reply(200, outlineTabDataCompleteAssignment);
      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      render(<OutlineTab />, { store });
      expect(screen.getByTitle('Completed section')).toBeInTheDocument();
    });

    it('displays correct icon for incomplete assignment', async () => {
      const { courseBlocks } = await buildSimpleCourseBlocks(courseId, outlineTabData.title, { complete: false });
      const outlineTabDataIncompleteAssignment = Factory.build('outlineTabData', {
        courseId,
        course_blocks: { blocks: courseBlocks.blocks },
      });
      axiosMock.onGet(outlineUrl).reply(200, outlineTabDataIncompleteAssignment);
      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      render(<OutlineTab />, { store });
      expect(screen.getByTitle('Incomplete section')).toBeInTheDocument();
    });
  });

  describe('Welcome Message', () => {
    it('does not render show more/less button under 100 words', () => {
      render(<OutlineTab />, { store });
      expect(screen.getByTestId('alert-container-welcome')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
    });

    describe('over 100 words', () => {
      beforeEach(async () => {
        const outlineTabDataLongMessage = Factory.build('outlineTabData', {
          courseId,
          welcome_message_html: '<p>'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + '</p>',
        });
        axiosMock.onGet(outlineUrl).reply(200, outlineTabDataLongMessage);
        await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

        render(<OutlineTab />, { store });
      });

      it('shortens message', async () => {
        expect(screen.getByTestId('short-welcome-message-iframe')).toBeInTheDocument();
        const showMoreButton = screen.queryByRole('button', { name: 'Show More' });
        expect(showMoreButton).toBeInTheDocument();
      });

      it('renders show more/less button and handles click', async () => {
        expect(screen.getByTestId('alert-container-welcome')).toBeInTheDocument();
        let showMoreButton = screen.getByRole('button', { name: 'Show More' });
        expect(showMoreButton).toBeInTheDocument();

        userEvent.click(showMoreButton);
        let showLessButton = screen.getByRole('button', { name: 'Show Less' });
        expect(showLessButton).toBeInTheDocument();
        expect(screen.getByTestId('long-welcome-message-iframe')).toBeInTheDocument();

        userEvent.click(showLessButton);
        showLessButton = screen.queryByRole('button', { name: 'Show Less' });
        expect(showLessButton).not.toBeInTheDocument();
        showMoreButton = screen.getByRole('button', { name: 'Show More' });
        expect(showMoreButton).toBeInTheDocument();
      });
    });

    it('does not display if no update available', async () => {
      const outlineTabDataSansUpdate = Factory.build('outlineTabData', {
        courseId,
        welcome_message_html: null,
      });
      axiosMock.onGet(outlineUrl).reply(200, outlineTabDataSansUpdate);
      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      render(<OutlineTab />, { store });
      expect(screen.queryByTestId('alert-container-welcome')).not.toBeInTheDocument();
    });
  });

  describe('Course Goals', () => {
    const goalOptions = [
      ['certify', 'Earn a certificate'],
      ['complete', 'Complete the course'],
      ['explore', 'Explore the course'],
      ['unsure', 'Not sure yet'],
    ];

    it('does not render goal widgets if no goals available', () => {
      render(<OutlineTab />, { store });
      expect(screen.queryByTestId('course-goal-card')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Goal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-goal-selector')).not.toBeInTheDocument();
    });

    describe('goal is not set', () => {
      beforeEach(async () => {
        const outlineTabDataGoalNotSet = Factory.build('outlineTabData', {
          courseId,
          course_goals: {
            goal_options: goalOptions,
            selected_goal: null,
          },
        });
        axiosMock.onGet(outlineUrl).reply(200, outlineTabDataGoalNotSet);
        await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

        render(<OutlineTab />, { store });
      });

      it('renders goal card', () => {
        expect(screen.queryByLabelText('Goal')).not.toBeInTheDocument();
        expect(screen.getByTestId('course-goal-card')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Earn a certificate' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Complete the course' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Explore the course' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Not sure yet' })).toBeInTheDocument();
      });

      it('renders goal selector on goal selection', async () => {
        const certifyGoalButton = screen.getByRole('button', { name: 'Earn a certificate' });
        fireEvent.click(certifyGoalButton);

        const goalSelector = await screen.findByTestId('edit-goal-selector');
        expect(goalSelector).toBeInTheDocument();
      });
    });

    describe('goal is set', () => {
      beforeEach(async () => {
        const outlineTabDataGoalSet = Factory.build('outlineTabData', {
          courseId,
          course_goals: {
            goal_options: goalOptions,
            selected_goal: { text: 'Earn a certificate', key: 'certify' },
          },
        });

        axiosMock.onGet(outlineUrl).reply(200, outlineTabDataGoalSet);
        await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

        render(<OutlineTab />, { store });
      });

      it('renders edit goal selector', () => {
        expect(screen.getByLabelText('Goal')).toBeInTheDocument();
        expect(screen.getByTestId('edit-goal-selector')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Earn a certificate' })).toBeInTheDocument();
      });

      it('updates goal on click', async () => {
        // Open dropdown
        const dropdownButtonNode = screen.getByRole('button', { name: 'Earn a certificate' });
        await waitFor(() => {
          expect(dropdownButtonNode).toBeInTheDocument();
        });
        fireEvent.click(dropdownButtonNode);

        // Select a new goal
        const unsureButtonNode = screen.getByRole('button', { name: 'Not sure yet' });
        await waitFor(() => {
          expect(unsureButtonNode).toBeInTheDocument();
        });
        fireEvent.click(unsureButtonNode);

        // Verify the request was made
        await waitFor(() => {
          expect(axiosMock.history.post[0].url).toMatch(goalUrl);
          expect(axiosMock.history.post[0].data).toMatch(`{"course_id":"${courseId}","goal_key":"unsure"}`);
        });
      });
    });
  });

  describe('Course Handouts', () => {
    it('renders title when handouts are available', () => {
      render(<OutlineTab />, { store });
      expect(screen.queryByRole('heading', { name: 'Course Handouts' })).toBeInTheDocument();
    });

    it('does not display title if no handouts available', async () => {
      const outlineTabDataSansHandout = Factory.build('outlineTabData', {
        courseId,
        handouts_html: null,
      });
      axiosMock.onGet(outlineUrl).reply(200, outlineTabDataSansHandout);
      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      render(<OutlineTab />, { store });
      expect(screen.queryByRole('heading', { name: 'Course Handouts' })).not.toBeInTheDocument();
    });
  });

  describe('Alert List', () => {
    describe('Enrollment Alert', () => {
      let extraText;
      let alertMessage;
      let staffMessage;

      beforeEach(() => {
        extraText = outlineTabData.enroll_alert.extra_text;
        alertMessage = `You must be enrolled in the course to see course content. ${extraText}`;
        staffMessage = 'You are viewing this course as staff, and are not enrolled.';
      });

      it('does not display enrollment alert for enrolled user', async () => {
        const courseHomeMetadataForEnrolledUser = Factory.build(
          'courseHomeMetadata', { course_id: courseId, is_enrolled: true },
          { courseTabs: courseMetadata.tabs },
        );
        axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadataForEnrolledUser);
        await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

        render(<OutlineTab />, { store });

        expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
      });

      it('does not display enrollment button if enrollment is not available', async () => {
        const outlineTabDataCannotEnroll = Factory.build('outlineTabData', {
          courseId,
          enroll_alert: {
            can_enroll: false,
            extra_text: extraText,
          },
        });
        axiosMock.onGet(outlineUrl).reply(200, outlineTabDataCannotEnroll);
        await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

        render(<OutlineTab />, { store });

        expect(screen.queryByRole('button', { name: 'Enroll Now' })).not.toBeInTheDocument();
      });

      it('displays enrollment alert for unenrolled user', async () => {
        render(<OutlineTab />, { store });

        const alert = await screen.findByText(alertMessage);
        expect(alert).toHaveAttribute('role', 'alert');
        const alertContainer = await screen.findByTestId(`alert-container-${ALERT_TYPES.ERROR}`);
        expect(screen.queryByText(staffMessage)).not.toBeInTheDocument();

        expect(alertContainer.querySelector('svg')).toHaveClass('fa-exclamation-triangle');
      });

      it('displays different message for unenrolled staff user', async () => {
        const courseHomeMetadataForUnenrolledStaff = Factory.build(
          'courseHomeMetadata', { course_id: courseId, is_staff: true },
          { courseTabs: courseMetadata.tabs },
        );
        axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadataForUnenrolledStaff);
        // We need to remove offer_html and course_expired_html to limit the number of alerts we
        // show, which makes this test easier to write.  If there's only one, it's easy to query
        // for below.
        const outlineTabDataCannotEnroll = Factory.build('outlineTabData', {
          courseId,
          offer_html: null,
          course_expired_html: null,
        });
        axiosMock.onGet(outlineUrl).reply(200, outlineTabDataCannotEnroll);
        await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

        render(<OutlineTab />, { store });

        const alert = await screen.findByText(staffMessage);
        expect(alert).toHaveAttribute('role', 'alert');
        expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
        const alertContainer = await screen.findByTestId(`alert-container-${ALERT_TYPES.INFO}`);
        expect(alertContainer.querySelector('svg')).toHaveClass('fa-info-circle');
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
        render(<OutlineTab />, { store });

        const button = await screen.findByRole('button', { name: 'Enroll Now' });
        fireEvent.click(button);
        await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
        expect(axiosMock.history.post[0].data)
          .toEqual(JSON.stringify({ course_details: { course_id: courseId } }));
        expect(window.location.reload).toHaveBeenCalledTimes(1);

        window.location = location;
      });
    });

    describe('Access Expiration Alert', () => {
      // TODO: Test this alert.
    });

    describe('Course Start Alert', () => {
      // TODO: Test this alert.
    });

    describe('Course End Alert', () => {
      // TODO: Test this alert.
    });

    describe('Certificate Available Alert', () => {
      // TODO: Test this alert.
    });
  });
});

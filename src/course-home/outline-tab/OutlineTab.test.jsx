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

  const courseId = 'course-v1:edX+Test+run';
  const courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`;
  const enrollmentUrl = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  const goalUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/save_course_goal`;
  const outlineUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/outline/${courseId}`;

  const store = initializeStore();
  const defaultMetadata = Factory.build('courseHomeMetadata', { courseId });
  const defaultTabData = Factory.build('outlineTabData');

  function setMetadata(attributes, options) {
    const courseMetadata = Factory.build('courseHomeMetadata', { courseId, ...attributes }, options);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  }

  function setTabData(attributes, options) {
    const outlineTabData = Factory.build('outlineTabData', attributes, options);
    axiosMock.onGet(outlineUrl).reply(200, outlineTabData);
  }

  async function fetchAndRender() {
    await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);
    render(<OutlineTab />, { store });
  }

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Set defaults for network requests
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    axiosMock.onPost(enrollmentUrl).reply(200, {});
    axiosMock.onPost(goalUrl).reply(200, { header: 'Success' });
    axiosMock.onGet(outlineUrl).reply(200, defaultTabData);

    logUnhandledRequests(axiosMock);
  });

  describe('Course Outline', () => {
    it('displays link to start course', async () => {
      await fetchAndRender();
      expect(screen.getByRole('link', { name: 'Start Course' })).toBeInTheDocument();
    });

    it('displays link to resume course', async () => {
      setTabData({
        resume_course: {
          has_visited_course: true,
          url: `${getConfig().LMS_BASE_URL}/courses/${courseId}/jump_to/block-v1:edX+Test+Block@12345abcde`,
        },
      });
      await fetchAndRender();
      expect(screen.getByRole('link', { name: 'Resume Course' })).toBeInTheDocument();
    });

    it('expands section that contains resume block', async () => {
      const { courseBlocks } = await buildSimpleCourseBlocks(courseId, 'Title', { resumeBlock: true });
      setTabData({
        course_blocks: { blocks: courseBlocks.blocks },
      });
      await fetchAndRender();
      const expandedSectionNode = screen.getByRole('button', { name: /Title of Section/ });
      expect(expandedSectionNode).toHaveAttribute('aria-expanded', 'true');
    });

    it('handles expand/collapse all button click', async () => {
      await fetchAndRender();
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
      const { courseBlocks } = await buildSimpleCourseBlocks(courseId, 'Title', { complete: true });
      setTabData({
        course_blocks: { blocks: courseBlocks.blocks },
      });
      await fetchAndRender();
      expect(screen.getByTitle('Completed section')).toBeInTheDocument();
    });

    it('displays correct icon for incomplete assignment', async () => {
      const { courseBlocks } = await buildSimpleCourseBlocks(courseId, 'Title', { complete: false });
      setTabData({
        course_blocks: { blocks: courseBlocks.blocks },
      });
      await fetchAndRender();
      expect(screen.getByTitle('Incomplete section')).toBeInTheDocument();
    });
  });

  describe('Welcome Message', () => {
    it('does not render show more/less button under 100 words', async () => {
      await fetchAndRender();
      expect(screen.getByTestId('alert-container-welcome')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
    });

    describe('over 100 words', () => {
      beforeEach(async () => {
        setTabData({
          welcome_message_html: '<p>'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + 'This is a test welcome message that happens to be longer than one hundred words. We hope it will be shortened.'
            + '</p>',
        });
        await fetchAndRender();
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
      setTabData({ welcome_message_html: null });
      await fetchAndRender();
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

    it('does not render goal widgets if no goals available', async () => {
      await fetchAndRender();
      expect(screen.queryByTestId('course-goal-card')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Goal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-goal-selector')).not.toBeInTheDocument();
    });

    describe('goal is not set', () => {
      beforeEach(async () => {
        setTabData({
          course_goals: {
            goal_options: goalOptions,
            selected_goal: null,
          },
        });
        await fetchAndRender();
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
        setTabData({
          course_goals: {
            goal_options: goalOptions,
            selected_goal: { text: 'Earn a certificate', key: 'certify' },
          },
        });
        await fetchAndRender();
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
    it('renders title when handouts are available', async () => {
      await fetchAndRender();
      expect(screen.queryByRole('heading', { name: 'Course Handouts' })).toBeInTheDocument();
    });

    it('does not display title if no handouts available', async () => {
      setTabData({ handouts_html: null });
      await fetchAndRender();
      expect(screen.queryByRole('heading', { name: 'Course Handouts' })).not.toBeInTheDocument();
    });
  });

  describe('Alert List', () => {
    describe('Enrollment Alert', () => {
      let alertMessage;
      let staffMessage;

      beforeEach(() => {
        const extraText = defaultTabData.enroll_alert.extra_text;
        alertMessage = `You must be enrolled in the course to see course content. ${extraText}`;
        staffMessage = 'You are viewing this course as staff, and are not enrolled.';
      });

      it('does not display enrollment alert for enrolled user', async () => {
        setMetadata({ is_enrolled: true });
        await fetchAndRender();
        expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
      });

      it('does not display enrollment button if enrollment is not available', async () => {
        setTabData({
          enroll_alert: {
            can_enroll: false,
          },
        });
        await fetchAndRender();
        expect(screen.queryByRole('button', { name: 'Enroll Now' })).not.toBeInTheDocument();
      });

      it('displays enrollment alert for unenrolled user', async () => {
        await fetchAndRender();

        const alert = await screen.findByText(alertMessage);
        expect(alert).toHaveAttribute('role', 'alert');
        const alertContainer = await screen.findByTestId(`alert-container-${ALERT_TYPES.ERROR}`);
        expect(screen.queryByText(staffMessage)).not.toBeInTheDocument();

        expect(alertContainer.querySelector('svg')).toHaveClass('fa-exclamation-triangle');
      });

      it('displays different message for unenrolled staff user', async () => {
        setMetadata({ is_staff: true });
        await fetchAndRender();

        const alert = await screen.findByText(staffMessage);
        expect(alert).toHaveAttribute('role', 'alert');
        expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
        const alertContainer = await screen.findByTestId(`alert-container-${ALERT_TYPES.INFO}`);
        expect(alertContainer.querySelector('svg')).toHaveClass('fa-info-circle');
      });

      it('handles button click', async () => {
        const { location } = window;
        delete window.location;
        window.location = {
          reload: jest.fn(),
        };
        await fetchAndRender();

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
      // Appears if course_expired_html is provided
      it('appears', async () => {
        setTabData({ course_expired_html: '<p>Course Will Expire, Uh Oh</p>' });
        await fetchAndRender();
        await screen.findByText('Course Will Expire, Uh Oh');
      });
    });

    describe('Course Start Alert', () => {
      // Only appears if enrolled and before start of course
      it('appears several days out', async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 100);
        setMetadata({ is_enrolled: true });
        setTabData({}, {
          dateBlocks: [
            {
              date_type: 'course-start-date',
              date: startDate.toISOString(),
              title: 'Start',
            },
          ],
        });
        await fetchAndRender();
        const node = await screen.findByText('Course starts', { exact: false });
        expect(node.textContent).toMatch(/.* on .*/); // several days away uses "on" before date
      });

      it('appears today', async () => {
        const startDate = new Date();
        startDate.setHours(startDate.getHours() + 1);
        setMetadata({ is_enrolled: true });
        setTabData({}, {
          dateBlocks: [
            {
              date_type: 'course-start-date',
              date: startDate.toISOString(),
              title: 'Start',
            },
          ],
        });
        await fetchAndRender();
        const node = await screen.findByText('Course starts', { exact: false });
        expect(node.textContent).toMatch(/.* at .*/); // same day uses "at" before date
      });
    });

    describe('Course End Alert', () => {
      // Only appears if enrolled and within 14 days before the end of course
      it('appears several days out', async () => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 13);
        setMetadata({ is_enrolled: true });
        setTabData({}, {
          dateBlocks: [
            {
              date_type: 'course-end-date',
              date: endDate.toISOString(),
              title: 'End',
            },
          ],
        });
        await fetchAndRender();
        const node = await screen.findByText('This course is ending', { exact: false });
        expect(node.textContent).toMatch(/.* on .*/); // several days away uses "on" before date
      });

      it('appears today', async () => {
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + 1);
        setMetadata({ is_enrolled: true });
        setTabData({}, {
          dateBlocks: [
            {
              date_type: 'course-end-date',
              date: endDate.toISOString(),
              title: 'End',
            },
          ],
        });
        await fetchAndRender();
        const node = await screen.findByText('This course is ending', { exact: false });
        expect(node.textContent).toMatch(/.* at .*/); // same day uses "at" before date
      });
    });

    describe('Certificate Available Alert', () => {
      // Must satisfy two conditions for alert to appear: enrolled and between course end and cert availability
      it('appears', async () => {
        const now = new Date();
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        setMetadata({ is_enrolled: true });
        setTabData({}, {
          dateBlocks: [
            {
              date_type: 'course-end-date',
              date: yesterday.toISOString(),
              title: 'End',
            },
            {
              date_type: 'certificate-available-date',
              date: tomorrow.toISOString(),
              title: 'Cert Available',
            },
          ],
        });
        await fetchAndRender();
        await screen.findByText('We are working on generating course certificates.');
      });
    });
  });
});

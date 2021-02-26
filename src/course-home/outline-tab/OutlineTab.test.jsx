import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import buildSimpleCourseBlocks from '../data/__factories__/courseBlocks.factory';
import {
  fireEvent, initializeMockApp, logUnhandledRequests, render, screen, waitFor, act,
} from '../../setupTest';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';
import * as thunks from '../data/thunks';
import initializeStore from '../../store';
import OutlineTab from './OutlineTab';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('Outline Tab', () => {
  let axiosMock;

  const courseId = 'course-v1:edX+Test+run';
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);
  const enrollmentUrl = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  const goalUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/save_course_goal`;
  const outlineUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/outline/${courseId}`;
  const proctoringInfoUrl = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/user_onboarding/status?course_id=${encodeURIComponent(courseId)}`;

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
    await act(async () => render(<OutlineTab />, { store }));
  }

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Set defaults for network requests
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    axiosMock.onPost(enrollmentUrl).reply(200, {});
    axiosMock.onPost(goalUrl).reply(200, { header: 'Success' });
    axiosMock.onGet(outlineUrl).reply(200, defaultTabData);
    axiosMock.onGet(proctoringInfoUrl).reply(200, { onboarding_status: 'created', onboarding_link: 'test' });

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
      expect(screen.getByRole('link', { name: 'Resume course' })).toBeInTheDocument();
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
      const expandButton = screen.getByRole('button', { name: 'Expand all' });
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

    it('SequenceLink displays points to legacy courseware', async () => {
      const { courseBlocks } = await buildSimpleCourseBlocks(courseId, 'Title', { resumeBlock: true });
      setMetadata({
        can_load_courseware: false,
      });
      setTabData({
        course_blocks: { blocks: courseBlocks.blocks },
      });
      await fetchAndRender();

      const sequenceLink = screen.getByText('Title of Sequence');
      expect(sequenceLink.getAttribute('href')).toContain(`/courses/${courseId}`);
    });

    it('SequenceLink displays points to courseware MFE', async () => {
      const { courseBlocks } = await buildSimpleCourseBlocks(courseId, 'Title', { resumeBlock: true });
      setMetadata({
        can_load_courseware: true,
      });
      setTabData({
        course_blocks: { blocks: courseBlocks.blocks },
      });
      await fetchAndRender();

      const sequenceLink = screen.getByText('Title of Sequence');
      expect(sequenceLink.getAttribute('href')).toContain(`/course/${courseId}`);
    });
  });

  describe('Welcome Message', () => {
    beforeEach(() => {
      setMetadata({ is_enrolled: true });
    });

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
    describe('Private Course Alert', () => {
      it('does not display alert for enrolled user', async () => {
        setMetadata({ is_enrolled: true });
        await fetchAndRender();
        expect(screen.queryByRole('button', { name: 'Enroll now' })).not.toBeInTheDocument();
        expect(screen.queryByText('to access the full course')).not.toBeInTheDocument();
      });

      it('does not display enrollment button if enrollment is not available', async () => {
        setTabData({
          enroll_alert: {
            can_enroll: false,
          },
        });
        await fetchAndRender();

        const alert = await screen.findByText('Welcome to Demonstration Course');
        expect(alert.parentElement).toHaveAttribute('role', 'alert');

        expect(screen.queryByRole('button', { name: 'Enroll now' })).not.toBeInTheDocument();
        expect(screen.getByText('You must be enrolled in the course to see course content.')).toBeInTheDocument();
      });

      it('displays alert for unenrolled user', async () => {
        await fetchAndRender();

        const alert = await screen.findByText('Welcome to Demonstration Course');
        expect(alert.parentElement).toHaveAttribute('role', 'alert');

        expect(screen.getByRole('button', { name: 'Enroll now' })).toBeInTheDocument();
      });

      it('handles button click', async () => {
        const { location } = window;
        delete window.location;
        window.location = {
          reload: jest.fn(),
        };
        await fetchAndRender();

        const button = await screen.findByRole('button', { name: 'Enroll now' });
        fireEvent.click(button);
        await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
        expect(axiosMock.history.post[0].data)
          .toEqual(JSON.stringify({ course_details: { course_id: courseId } }));
        expect(window.location.reload).toHaveBeenCalledTimes(1);

        window.location = location;
      });
    });

    describe('Access Expiration Alert', () => {
      it('has special masquerade text', async () => {
        setTabData({
          access_expiration: {
            expiration_date: '2020-01-01T12:00:00Z',
            masquerading_expired_course: true,
            upgrade_deadline: null,
            upgrade_url: null,
          },
        });
        await fetchAndRender();
        await screen.findByText('This learner does not have access to this course.', { exact: false });
      });

      it('shows expiration', async () => {
        setTabData({
          access_expiration: {
            expiration_date: '2080-01-01T12:00:00Z',
            masquerading_expired_course: false,
            upgrade_deadline: null,
            upgrade_url: null,
          },
        });
        await fetchAndRender();
        await screen.findByText('Audit Access Expires');
      });

      it('shows upgrade prompt', async () => {
        setTabData({
          access_expiration: {
            expiration_date: '2080-01-01T12:00:00Z',
            masquerading_expired_course: false,
            upgrade_deadline: '2070-01-01T12:00:00Z',
            upgrade_url: 'https://example.com/upgrade',
          },
        });
        await fetchAndRender();
        await screen.findByText('to get unlimited access to the course as long as it exists on the site.', { exact: false });
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

  describe('Proctoring Info Panel', () => {
    it('appears', async () => {
      await fetchAndRender();
      await screen.findByText('This course contains proctored exams');
      expect(screen.queryByRole('link', { name: 'Review instructions and system requirements' })).toBeInTheDocument();
    });

    it('appears for verified', async () => {
      axiosMock.onGet(proctoringInfoUrl).reply(200, { onboarding_status: 'verified', onboarding_link: 'test' });
      await fetchAndRender();
      await screen.findByText('This course contains proctored exams');
      expect(screen.queryByRole('link', { name: 'Complete Onboarding' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Review instructions and system requirements' })).toBeInTheDocument();
      expect(screen.queryByText('You must complete the onboarding process prior to taking any proctored exam.')).not.toBeInTheDocument();
      expect(screen.queryByText('Onboarding profile review, including identity verification, can take 2+ business days.')).not.toBeInTheDocument();
    });

    it('appears for rejected', async () => {
      axiosMock.onGet(proctoringInfoUrl).reply(200, { onboarding_status: 'rejected', onboarding_link: 'test' });
      await fetchAndRender();
      await screen.findByText('This course contains proctored exams');
      expect(screen.queryByRole('link', { name: 'Complete Onboarding' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Review instructions and system requirements' })).toBeInTheDocument();
      expect(screen.queryByText('You must complete the onboarding process prior to taking any proctored exam.')).toBeInTheDocument();
      expect(screen.queryByText('Onboarding profile review, including identity verification, can take 2+ business days.')).toBeInTheDocument();
    });

    it('appears for submitted', async () => {
      axiosMock.onGet(proctoringInfoUrl).reply(200, { onboarding_status: 'submitted', onboarding_link: 'test' });
      await fetchAndRender();
      await screen.findByText('This course contains proctored exams');
      expect(screen.queryByText('Your submitted profile is in review.')).toBeInTheDocument();
      expect(screen.queryByText('Onboarding profile review, including identity verification, can take 2+ business days.')).toBeInTheDocument();
    });

    it('appears for second_review_required', async () => {
      axiosMock.onGet(proctoringInfoUrl).reply(200, { onboarding_status: 'second_review_required', onboarding_link: 'test' });
      await fetchAndRender();
      await screen.findByText('This course contains proctored exams');
      expect(screen.queryByText('Your submitted profile is in review.')).toBeInTheDocument();
      expect(screen.queryByText('Onboarding profile review, including identity verification, can take 2+ business days.')).toBeInTheDocument();
    });

    it('appears for no status', async () => {
      axiosMock.onGet(proctoringInfoUrl).reply(200, { onboarding_status: '', onboarding_link: 'test' });
      await fetchAndRender();
      await screen.findByText('This course contains proctored exams');
      expect(screen.queryByRole('link', { name: 'Complete Onboarding' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Review instructions and system requirements' })).toBeInTheDocument();
      expect(screen.queryByText('You must complete the onboarding process prior to taking any proctored exam.')).toBeInTheDocument();
      expect(screen.queryByText('Onboarding profile review, including identity verification, can take 2+ business days.')).toBeInTheDocument();
    });

    it('does not appear for 404', async () => {
      axiosMock.onGet(proctoringInfoUrl).reply(404);
      expect(screen.queryByRole('link', { name: 'Review instructions and system requirements' })).not.toBeInTheDocument();
    });
  });
});

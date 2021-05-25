import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';

import {
  fireEvent, initializeMockApp, logUnhandledRequests, render, screen, act,
} from '../../setupTest';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';
import * as thunks from '../data/thunks';
import initializeStore from '../../store';
import ProgressTab from './ProgressTab';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('Progress Tab', () => {
  let axiosMock;

  const courseId = 'course-v1:edX+Test+run';
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);
  const progressUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/progress/${courseId}`;

  const store = initializeStore();
  const defaultMetadata = Factory.build('courseHomeMetadata', { id: courseId });
  const defaultTabData = Factory.build('progressTabData');

  function setMetadata(attributes, options) {
    const courseMetadata = Factory.build('courseHomeMetadata', { id: courseId, ...attributes }, options);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  }

  function setTabData(attributes, options) {
    const progressTabData = Factory.build('progressTabData', attributes, options);
    axiosMock.onGet(progressUrl).reply(200, progressTabData);
  }

  async function fetchAndRender() {
    await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);
    await act(async () => render(<ProgressTab />, { store }));
  }

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Set defaults for network requests
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    axiosMock.onGet(progressUrl).reply(200, defaultTabData);

    logUnhandledRequests(axiosMock);
  });

  describe('Course Grade', () => {
    it('renders Course Grade', async () => {
      await fetchAndRender();
      expect(screen.getByText('Grades')).toBeInTheDocument();
      expect(screen.getByText('This represents your weighted grade against the grade needed to pass this course.')).toBeInTheDocument();
    });

    it('renders correct copy for non-passing', async () => {
      setTabData({
        course_grade: {
          is_passing: false,
          letter_grade: null,
          percent: 0.5,
        },
      });
      await fetchAndRender();
      expect(screen.queryByRole('button', { name: 'Grade range tooltip' })).not.toBeInTheDocument();
      expect(screen.getByText('A weighted grade of 75% is required to pass in this course')).toBeInTheDocument();
    });

    it('renders correct copy for passing with pass/fail grade range', async () => {
      await fetchAndRender();
      expect(screen.queryByRole('button', { name: 'Grade range tooltip' })).not.toBeInTheDocument();
      expect(screen.getByText('You’re currently passing this course')).toBeInTheDocument();
    });

    it('renders correct copy and tooltip for non-passing with letter grade range', async () => {
      setTabData({
        course_grade: {
          is_passing: false,
          letter_grade: null,
          percent: 0,
        },
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            A: 0.9,
            B: 0.8,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByRole('button', { name: 'Grade range tooltip' }));
      expect(screen.getByText('A weighted grade of 80% is required to pass in this course')).toBeInTheDocument();
    });

    it('renders correct copy and tooltip for passing with letter grade range', async () => {
      setTabData({
        course_grade: {
          is_passing: true,
          letter_grade: 'B',
          percent: 0.85,
        },
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            A: 0.9,
            B: 0.8,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByRole('button', { name: 'Grade range tooltip' }));
      expect(await screen.findByText('You’re currently passing this course with a grade of B (80-90%)')).toBeInTheDocument();
    });

    it('renders tooltip for grade range', async () => {
      setTabData({
        course_grade: {
          percent: 0,
          is_passing: false,
        },
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            A: 0.9,
            B: 0.8,
          },
        },
      });
      await fetchAndRender();
      const tooltip = await screen.getByRole('button', { name: 'Grade range tooltip' });
      fireEvent.click(tooltip);
      expect(screen.getByText('Grade ranges for this course:'));
      expect(screen.getByText('A: 90%-100%'));
      expect(screen.getByText('B: 80%-90%'));
      expect(screen.getByText('F: <80%'));
    });

    it('renders locked feature preview with upgrade button when user has locked content', async () => {
      setTabData({
        completion_summary: {
          complete_count: 1,
          incomplete_count: 1,
          locked_count: 1,
        },
        verified_mode: {
          access_expiration_date: '2050-01-01T12:00:00',
          currency: 'USD',
          currency_symbol: '$',
          price: 149,
          sku: 'ABCD1234',
          upgrade_url: 'edx.org/upgrade',
        },
      });
      await fetchAndRender();
      expect(screen.getByText('locked feature')).toBeInTheDocument();
      expect(screen.getByText('Unlock to view grades and work towards a certificate.')).toBeInTheDocument();
      expect(screen.getAllByRole('link', 'Unlock now')).toHaveLength(3);
    });

    it('renders locked feature preview with no upgrade button when user has locked content but cannot upgrade', async () => {
      setTabData({
        completion_summary: {
          complete_count: 1,
          incomplete_count: 1,
          locked_count: 1,
        },
      });
      await fetchAndRender();
      expect(screen.getByText('locked feature')).toBeInTheDocument();
      expect(screen.getByText('The deadline to upgrade in this course has passed.')).toBeInTheDocument();
    });

    it('does not render locked feature preview when user does not have locked content', async () => {
      await fetchAndRender();
      expect(screen.queryByText('locked feature')).not.toBeInTheDocument();
    });
  });

  describe('Grade Summary', () => {
    it('renders Grade Summary table when assignment policies are populated', async () => {
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
    });

    it('does not render Grade Summary when assignment policies are not populated', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [],
        },
      });
      await fetchAndRender();
      expect(screen.queryByText('Grade summary')).not.toBeInTheDocument();
    });

    it('calculates grades correctly when number of droppable assignments equals total number of assignments', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 2,
              num_total: 2,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {footnote - optional} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 1 100% 0% 0%' })).toBeInTheDocument();
    });
    it('calculates grades correctly when number of droppable assignments is less than total number of assignments', async () => {
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {footnote - optional} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 1 100% 100% 100%' })).toBeInTheDocument();
    });
    it('calculates grades correctly when number of droppable assignments is zero', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 0,
              num_total: 2,
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 100% 50% 50%' })).toBeInTheDocument();
    });
    it('calculates grades correctly when number of total assignments is less than the number of assignments created', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              num_total: 1, // two assignments created in the factory, but 1 is expected per Studio settings
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {footnote - optional} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 1 100% 100% 100%' })).toBeInTheDocument();
    });
    it('calculates grades correctly when number of total assignments is greater than the number of assignments created', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 0,
              num_total: 5, // two assignments created in the factory, but 5 are expected per Studio settings
              short_label: 'HW',
              type: 'Homework',
              weight: 1,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 100% 20% 20%' })).toBeInTheDocument();
    });
    it('calculates weighted grades correctly', async () => {
      setTabData({
        grading_policy: {
          assignment_policies: [
            {
              num_droppable: 1,
              num_total: 2,
              short_label: 'HW',
              type: 'Homework',
              weight: 0.5,
            },
            {
              num_droppable: 0,
              num_total: 1,
              short_label: 'Ex',
              type: 'Exam',
              weight: 0.5,
            },
          ],
          grade_range: {
            pass: 0.75,
          },
        },
      });
      await fetchAndRender();
      expect(screen.getByText('Grade summary')).toBeInTheDocument();
      // The row is comprised of "{Assignment type} {footnote - optional} {weight} {grade} {weighted grade}"
      expect(screen.getByRole('row', { name: 'Homework 1 50% 100% 50%' })).toBeInTheDocument();
      expect(screen.getByRole('row', { name: 'Exam 50% 0% 0%' })).toBeInTheDocument();
    });
  });

  describe('Detailed Grades', () => {
    it('renders Detailed Grades table when section scores are populated', async () => {
      await fetchAndRender();
      expect(screen.getByText('Detailed grades')).toBeInTheDocument();

      expect(screen.getByRole('link', { name: 'First subsection' }));
      expect(screen.getByRole('link', { name: 'Second subsection' }));
    });

    it('render message when section scores are not populated', async () => {
      setTabData({
        section_scores: [],
      });
      await fetchAndRender();
      expect(screen.getByText('Detailed grades')).toBeInTheDocument();
      expect(screen.getByText('You currently have no graded problem scores.')).toBeInTheDocument();
    });
  });

  describe('Certificate Status', () => {
    beforeAll(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => {
          const matches = !!(query === 'screen and (min-width: 992px)');
          return {
            matches,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
          };
        }),
      });
    });

    describe('enrolled user', () => {
      beforeEach(async () => {
        setMetadata({ is_enrolled: true });
      });

      it('Displays text for nonPassing case when learner does not have a passing grade', async () => {
        await fetchAndRender();
        expect(screen.getByText('In order to qualify for a certificate, you must have a passing grade.')).toBeInTheDocument();
      });

      it('Displays text for inProgress case when more content is scheduled and the learner does not have a passing grade', async () => {
        setTabData({
          has_scheduled_content: true,
        });
        await fetchAndRender();
        expect(screen.getByText('It looks like there is more content in this course that will be released in the future. Look out for email updates or check back on your course for when this content will be available.')).toBeInTheDocument();
      });

      it('Displays request certificate link', async () => {
        setTabData({
          certificate_data: { cert_status: 'requesting' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.getByRole('button', { name: 'Request certificate' })).toBeInTheDocument();
      });

      it('Displays verify identity link', async () => {
        setTabData({
          certificate_data: { cert_status: 'unverified' },
          user_has_passing_grade: true,
          verification_data: { link: 'test' },
        });
        await fetchAndRender();
        expect(screen.getByRole('link', { name: 'Verify ID' })).toBeInTheDocument();
      });

      it('Displays verification pending message', async () => {
        setTabData({
          certificate_data: { cert_status: 'unverified' },
          verification_data: { status: 'pending' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.getByText('Your ID verification is pending and your certificate will be available once approved.')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Verify ID' })).not.toBeInTheDocument();
      });

      it('Displays download link', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'downloadable',
            download_url: 'fake.download.url',
          },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.getByRole('link', { name: 'Download my certificate' })).toBeInTheDocument();
      });

      it('Displays webview link', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'downloadable',
            cert_web_view_url: '/certificates/cooluuidgoeshere',
          },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.getByRole('link', { name: 'View my certificate' })).toBeInTheDocument();
      });

      it('Displays certificate is earned but unavailable message', async () => {
        setTabData({
          certificate_data: { cert_status: 'earned_but_not_available' },
          user_has_passing_grade: true,
        });
        await fetchAndRender();
        expect(screen.queryByText('Certificate status')).toBeInTheDocument();
      });

      it('Displays upgrade link when available', async () => {
        setTabData({
          certificate_data: { cert_status: 'audit_passing' },
          verified_mode: {
            upgrade_url: 'http://localhost:18130/basket/add/?sku=8CF08E5',
          },
        });
        await fetchAndRender();
        // Keep these text checks in sync with "audit only" test below, so it doesn't end up checking for text that is
        // never actually there, when/if the text changes.
        expect(screen.getByText('You are in an audit track and do not qualify for a certificate. In order to work towards a certificate, upgrade your course today.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Upgrade now' })).toBeInTheDocument();
      });

      it('Displays nothing if audit only', async () => {
        setTabData({
          certificate_data: { cert_status: 'audit_passing' },
        });
        await fetchAndRender();
        // Keep these queries in sync with "upgrade link" test above, so we don't end up checking for text that is
        // never actually there, when/if the text changes.
        expect(screen.queryByText('You are in an audit track and do not qualify for a certificate. In order to work towards a certificate, upgrade your course today.')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Upgrade now' })).not.toBeInTheDocument();
      });

      it('Does not display the certificate component if it does not match any statuses', async () => {
        setTabData({
          certificate_data: {
            cert_status: 'bogus_status',
          },
          user_has_passing_grade: true,
        });
        setMetadata({ is_enrolled: true });
        await fetchAndRender();
        expect(screen.queryByTestId('certificate-status-component')).not.toBeInTheDocument();
      });
    });

    it('Does not display the certificate component if the user is not enrolled', async () => {
      await fetchAndRender();
      expect(screen.queryByTestId('certificate-status-component')).not.toBeInTheDocument();
    });
  });
});

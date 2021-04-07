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
      await fetchAndRender();
      expect(screen.queryByRole('button', { name: 'Grade range tooltip' })).not.toBeInTheDocument();
      expect(screen.getByText('A weighted grade of 75% is required to pass in this course')).toBeInTheDocument();
    });

    it('renders correct copy for passing with pass/fail grade range', async () => {
      setTabData({
        course_grade: {
          is_passing: true,
          letter_grade: 'Pass',
          percent: 0.9,
        },
      });
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
});

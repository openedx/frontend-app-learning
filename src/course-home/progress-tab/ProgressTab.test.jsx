import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';

import {
  initializeMockApp, logUnhandledRequests, render, screen, act,
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

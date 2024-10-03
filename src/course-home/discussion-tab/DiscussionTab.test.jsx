import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';
import CoursewarePage from '@src/pages/courseware/components';
import DecodePageRoute from '@src/decode-page-route';
import { initializeMockApp, waitFor } from '@src/setupTest';
import { appendBrowserTimezoneToUrl } from '@src/utils';
import { UserMessagesProvider } from '../../generic/user-messages';
import initializeStore from '../../store';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('DiscussionTab', () => {
  let axiosMock;
  let store;
  let courseMetadataUrl;

  const courseMetadata = Factory.build('courseHomeMetadata', { user_timezone: 'America/New_York' });
  const { id: courseId } = courseMetadata;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();

    courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
    courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
    history.push(`/course/${courseId}/discussion`); // so tab can pull course id from url

    const component = (
      <AppProvider store={store}>
        <UserMessagesProvider>
          <Routes>
            <Route
              path="/course/:courseId/discussion"
              element={(
                <DecodePageRoute>
                  <CoursewarePage key="courseHome" activeKey="discussion" />
                </DecodePageRoute>
                  )}
            />
          </Routes>
        </UserMessagesProvider>
      </AppProvider>
    );

    render(component);
  });

  it('Validate discussion component url', async () => {
    // Simulate the redirect logic within your component
    await waitFor(() => {
      expect(window.location.href).toBe(`http://localhost/course/${courseId}/discussion`);
    });
  });
});

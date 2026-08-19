import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';
import { UserMessagesProvider } from '../../generic/user-messages';
import { ToastProvider } from '../../generic/ToastContext';
import {
  createTestQueryClient, initializeMockApp, messageEvent, screen, waitFor,
} from '../../setupTest';
import initializeStore from '../../store';
import { appendBrowserTimezoneToUrl } from '../../utils';
import DiscussionTab from './DiscussionTab';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('DiscussionTab', () => {
  let axiosMock;
  let store;
  let component;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    component = (
      <AppProvider store={store}>
        <QueryClientProvider client={createTestQueryClient(store)}>
          <UserMessagesProvider>
            <ToastProvider>
              <Routes>
                <Route
                  path="/course/:courseId/discussion"
                  element={<DiscussionTab />}
                />
              </Routes>
            </ToastProvider>
          </UserMessagesProvider>
        </QueryClientProvider>
      </AppProvider>
    );
  });

  const courseMetadata = Factory.build('courseHomeMetadata', { user_timezone: 'America/New_York' });
  const { id: courseId } = courseMetadata;

  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  beforeEach(() => {
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
    history.push(`/course/${courseId}/discussion`); // so tab can pull course id from url

    render(component);
  });

  it('resizes when it gets a size hint from iframe', async () => {
    window.postMessage({ ...messageEvent, payload: { height: 1234 } }, '*');
    await waitFor(() => expect(screen.getByTitle('discussion'))
      .toHaveAttribute('height', String(1234)));
  });
});

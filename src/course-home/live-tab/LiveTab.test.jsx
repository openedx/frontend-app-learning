import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';
import { UserMessagesProvider } from '../../generic/user-messages';
import { ToastProvider } from '../../generic/ToastContext';
import {
  createTestQueryClient, initializeMockApp, screen, waitFor,
} from '../../setupTest';
import initializeStore from '../../store';
import { appendBrowserTimezoneToUrl } from '../../utils';
import LiveTab from './LiveTab';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('LiveTab', () => {
  let axiosMock;
  let store;
  let component;
  let queryClient;

  const courseMetadata = Factory.build('courseHomeMetadata', { user_timezone: 'America/New_York' });
  const { id: courseId } = courseMetadata;

  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);
  const liveUrl = `${getConfig().LMS_BASE_URL}/api/course_live/iframe/${courseId}/`;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    queryClient = createTestQueryClient(store);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
    component = (
      <AppProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <UserMessagesProvider>
            <ToastProvider>
              <Routes>
                <Route path="/course/:courseId/live" element={<LiveTab />} />
              </Routes>
            </ToastProvider>
          </UserMessagesProvider>
        </QueryClientProvider>
      </AppProvider>
    );
    history.push(`/course/${courseId}/live`); // so tab can pull course id from url
  });

  afterEach(() => {
    focusManager.setFocused(undefined);
  });

  it('renders the live iframe html from the query', async () => {
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live"></iframe>',
    });

    render(component);

    await waitFor(() => expect(screen.getByTitle('live-embed')).toBeInTheDocument());
  });

  it('does not refetch the live embed when the window regains focus', async () => {
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live"></iframe>',
    });

    render(component);
    await waitFor(() => expect(screen.getByTitle('live-embed')).toBeInTheDocument());

    const liveCallCount = () => axiosMock.history.get.filter(req => req.url === liveUrl).length;
    expect(liveCallCount()).toBe(1);

    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });

    expect(liveCallCount()).toBe(1);
  });

  it('re-applies the sizing classes when the iframe html changes', async () => {
    axiosMock.onGet(liveUrl).replyOnce(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live-a"></iframe>',
    });
    axiosMock.onGet(liveUrl).reply(200, {
      iframe: '<iframe id="lti-tab-embed" title="live-embed" src="https://example.com/live-b"></iframe>',
    });

    render(component);
    await waitFor(() => expect(screen.getByTitle('live-embed')).toHaveAttribute('src', 'https://example.com/live-a'));
    expect(screen.getByTitle('live-embed')).toHaveClass('vh-100', 'w-100', 'border-0');

    await act(async () => { await queryClient.invalidateQueries(); });

    await waitFor(() => expect(screen.getByTitle('live-embed')).toHaveAttribute('src', 'https://example.com/live-b'));
    expect(screen.getByTitle('live-embed')).toHaveClass('vh-100', 'w-100', 'border-0');
  });
});

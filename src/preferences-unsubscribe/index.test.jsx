import React from 'react';

import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { ROUTES } from '../constants';
import {
  initializeTestStore, initializeMockApp, render, screen, waitFor,
} from '../setupTest';
import { getUnsubscribeUrl } from './data/api';
import PreferencesUnsubscribe from './index';
import initializeStore from '../store';
import { UserMessagesProvider } from '../generic/user-messages';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('Notification Preferences One Click Unsubscribe', () => {
  let axiosMock;
  let component;
  let store;
  const userToken = '1234';
  const url = getUnsubscribeUrl(userToken);

  beforeAll(async () => {
    await initializeTestStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  beforeEach(() => {
    sendTrackEvent.mockClear();
    axiosMock.reset();
    store = initializeStore();
    component = (
      <AppProvider store={store} wrapWithRouter={false}>
        <UserMessagesProvider>
          <MemoryRouter initialEntries={[`${`/preferences-unsubscribe/${userToken}/`}`]}>
            <Routes>
              <Route path={ROUTES.PREFERENCES_UNSUBSCRIBE} element={<PreferencesUnsubscribe />} />
            </Routes>
          </MemoryRouter>
        </UserMessagesProvider>
      </AppProvider>
    );
  });

  it('tests UI when unsubscribe is successful', async () => {
    axiosMock.onGet(url).reply(200, { result: 'success' });
    render(component);

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('heading-text')).toHaveTextContent('Unsubscribe successful');
  });

  it('tests UI when unsubscribe failed', async () => {
    axiosMock.onGet(url).reply(400, { result: 'failed' });
    render(component);

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('heading-text')).toHaveTextContent('Error unsubscribing from preference');
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.notifications.preferences.unsubscribe', {
      userToken,
    });
  });
});

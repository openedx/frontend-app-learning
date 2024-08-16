import React from 'react';
import {
  MemoryRouter, Route, Routes,
} from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getUnsubscribeUrl } from './data/api';
import NotificationPreferencesUnsubscribe from './NotificationPreferencesUnsubscribe';
import {
  initializeTestStore, render, screen, waitFor,
} from '../setupTest';
import { ROUTES } from '../constants';

describe('Notification Preferences One Click Unsubscribe', () => {
  let axiosMock;
  let component;
  const url = getUnsubscribeUrl('user', 'patch');

  beforeAll(async () => {
    await initializeTestStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  beforeEach(() => {
    axiosMock.reset();
    component = (
      <MemoryRouter initialEntries={['/preferences-unsubscribe/user/patch/']}>
        <Routes>
          <Route path={ROUTES.NOTIFICATION_PREFERENCES_UNSUBSCRIBE} element={<NotificationPreferencesUnsubscribe />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('tests UI when unsubscribe is successful', async () => {
    axiosMock.onGet(url).reply(200, { result: 'success' });
    render(component);

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
    expect(screen.getByTestId('heading-text')).toHaveTextContent('Unsubscribe successful');
  });

  it('tests UI when unsubscribe failed', async () => {
    axiosMock.onGet(url).reply(400, { result: 'failed' });
    render(component);

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
    expect(screen.getByTestId('heading-text')).toHaveTextContent('Error unsubscribing from preference');
  });
});

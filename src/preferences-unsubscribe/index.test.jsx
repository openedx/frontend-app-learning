import MockAdapter from 'axios-mock-adapter';
import {
  getAnalyticsService, getAuthenticatedHttpClient, getLoggingService, getSiteConfig, runPageRules,
  setAuthenticatedUser, setSiteConfig,
} from '@openedx/frontend-base';
import { act, screen, waitFor } from '@testing-library/react';

import { accountRole } from '@src/constants';
import routes from '@src/routes';
import { authenticatedUser } from '@src/tests/authenticatedUser';
import { renderRoutes } from '@src/tests/render';
import { getUnsubscribeUrl } from './data/api';

const { sendPageEvent, sendTrackEvent } = getAnalyticsService();
const siteConfig = getSiteConfig();

describe('Notification Preferences One Click Unsubscribe', () => {
  let axiosMock;
  const userToken = '1234';
  const url = getUnsubscribeUrl(userToken);
  const renderPage = (path = `/learning/preferences-unsubscribe/${userToken}/`) => renderRoutes(routes, path);

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    sendPageEvent.mockClear();
    sendTrackEvent.mockClear();
    getLoggingService().logError.mockClear();
    setSiteConfig({ ...siteConfig, externalRoutes: [{ role: accountRole, url: 'http://localhost:1997/' }] });
  });

  afterEach(() => {
    act(() => {
      setSiteConfig(siteConfig);
      setAuthenticatedUser(authenticatedUser);
    });
  });

  it('tests UI when unsubscribe is successful', async () => {
    axiosMock.onGet(url).reply(200, { result: 'success' });
    renderPage();

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);

    expect(await screen.findByTestId('heading-text')).toHaveTextContent('Unsubscribe successful');
    expect(runPageRules(document)).toEqual([]);
  });

  it('tests UI when unsubscribe failed', async () => {
    axiosMock.onGet(url).reply(400, { result: 'failed' });
    renderPage();

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('heading-text')).toHaveTextContent('Error unsubscribing from preference');
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.notifications.preferences.unsubscribe', {
      userToken,
    });
    expect(getLoggingService().logError).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'preferences page' }))
      .toHaveAttribute('href', 'http://localhost:1997/#notifications');
  });

  it('sends the page event', async () => {
    axiosMock.onGet(url).reply(200, { result: 'success' });
    renderPage();
    await screen.findByTestId('heading-text');

    expect(sendPageEvent).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes an anonymous visitor', async () => {
    setAuthenticatedUser(null);
    axiosMock.onGet(url).reply(200, { result: 'success' });
    renderPage();

    expect(await screen.findByTestId('heading-text')).toHaveTextContent('Unsubscribe successful');
    expect(axiosMock.history.get.map((request) => request.url)).toEqual([url]);
  });

  it('ignores the optional update segment', async () => {
    axiosMock.onGet(url).reply(200, { result: 'success' });
    renderPage(`/learning/preferences-unsubscribe/${userToken}/patch`);

    expect(await screen.findByTestId('heading-text')).toHaveTextContent('Unsubscribe successful');
    expect(axiosMock.history.get.map((request) => request.url)).toEqual([url]);
  });

  it('leaves out the preference-center link when nothing provides the account role', async () => {
    setSiteConfig(siteConfig);
    axiosMock.onGet(url).reply(400, { result: 'failed' });
    renderPage();

    expect(await screen.findByTestId('heading-text')).toHaveTextContent('Error unsubscribing from preference');
    expect(screen.queryByRole('link', { name: 'preferences page' })).not.toBeInTheDocument();
  });
});

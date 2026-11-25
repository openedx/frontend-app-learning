import MockAdapter from 'axios-mock-adapter';
import {
  getAnalyticsService, getAuthenticatedHttpClient, getSiteConfig, mergeAppConfig, runPageRules, setAuthenticatedUser,
  setSiteConfig,
} from '@openedx/frontend-base';
import { act, screen } from '@testing-library/react';

import { appId, dashboardRole } from '@src/constants';
import routes from '@src/routes';
import { authenticatedUser } from '@src/tests/authenticatedUser';
import { renderRoutes } from '@src/tests/render';

const { sendPageEvent, sendTrackEvent } = getAnalyticsService();
const siteConfig = getSiteConfig();

describe('GoalUnsubscribe', () => {
  let axiosMock;
  const unsubscribeUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/unsubscribe_from_course_goal/TOKEN`;
  const renderPage = () => renderRoutes(routes, '/learning/goal-unsubscribe/TOKEN');

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    sendPageEvent.mockClear();
    sendTrackEvent.mockClear();
    setSiteConfig({ ...siteConfig, externalRoutes: [{ role: dashboardRole, url: 'http://localhost:18000/dashboard' }] });
    mergeAppConfig(appId, { CONTACT_URL: 'http://localhost:18000/contact' });
  });

  afterEach(() => {
    act(() => {
      setSiteConfig(siteConfig);
      mergeAppConfig(appId, { CONTACT_URL: null });
      setAuthenticatedUser(authenticatedUser);
    });
  });

  it('starts with a spinner', async () => {
    axiosMock.onPost(unsubscribeUrl).reply(() => new Promise(() => {}));
    renderPage();
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('sends the page event and the unsubscribe event', async () => {
    axiosMock.onPost(unsubscribeUrl).reply(200, { course_title: 'My Sample Course' });
    renderPage();
    await screen.findByText('You’ve unsubscribed from goal reminders');

    expect(sendPageEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.goal.unsubscribe', { token: 'TOKEN' });
  });

  it('loads a real token', async () => {
    axiosMock.onPost(unsubscribeUrl).reply(200, { course_title: 'My Sample Course' });
    renderPage();

    expect(await screen.findByText('You’ve unsubscribed from goal reminders')).toBeInTheDocument();
    expect(screen.getByText(/your goal for My Sample Course/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to dashboard' }))
      .toHaveAttribute('href', 'http://localhost:18000/dashboard');
    expect(runPageRules(document)).toEqual([]);
  });

  it('draws the envelope inline, in the brand color', async () => {
    axiosMock.onPost(unsubscribeUrl).reply(200, { course_title: 'My Sample Course' });
    const { container } = renderPage();
    await screen.findByText('You’ve unsubscribed from goal reminders');

    const envelope = container.querySelector('svg[viewBox="0 0 167 153"]');
    expect(envelope).toHaveClass('text-primary');
    expect(envelope.querySelector('path')).toHaveAttribute('fill', 'currentColor');
  });

  it('unsubscribes an anonymous visitor', async () => {
    setAuthenticatedUser(null);
    axiosMock.onPost(unsubscribeUrl).reply(200, { course_title: 'My Sample Course' });
    renderPage();

    expect(await screen.findByText('You’ve unsubscribed from goal reminders')).toBeInTheDocument();
    expect(axiosMock.history.post.map((request) => request.url)).toEqual([unsubscribeUrl]);
  });

  it('loads a bad token with an error page', async () => {
    axiosMock.onPost(unsubscribeUrl).reply(404, {});
    renderPage();

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to dashboard' }))
      .toHaveAttribute('href', 'http://localhost:18000/dashboard');
    expect(screen.getByRole('link', { name: 'contact support' }))
      .toHaveAttribute('href', 'http://localhost:18000/contact');
  });

  it('names support without a link when no contact URL is configured', async () => {
    mergeAppConfig(appId, { CONTACT_URL: null });
    axiosMock.onPost(unsubscribeUrl).reply(404, {});
    renderPage();

    expect(await screen.findByText(/contact support for help/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'contact support' })).not.toBeInTheDocument();
  });

  it('leaves out the dashboard button when nothing provides the dashboard role', async () => {
    setSiteConfig(siteConfig);
    axiosMock.onPost(unsubscribeUrl).reply(200, { course_title: 'My Sample Course' });
    renderPage();

    expect(await screen.findByText('You’ve unsubscribed from goal reminders')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Go to dashboard' })).not.toBeInTheDocument();
  });
});

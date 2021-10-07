import React from 'react';
import { Route } from 'react-router';
import MockAdapter from 'axios-mock-adapter';
import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';

import GoalUnsubscribe from './GoalUnsubscribe';
import { act, initializeMockApp } from '../../setupTest';
import initializeStore from '../../store';
import { UserMessagesProvider } from '../../generic/user-messages';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('GoalUnsubscribe', () => {
  let axiosMock;
  let store;
  let component;
  const unsubscribeUrl = `${getConfig().LMS_BASE_URL}/api/course_home/unsubscribe_from_course_goal/TOKEN`;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    component = (
      <AppProvider store={store}>
        <UserMessagesProvider>
          <Route path="/goal-unsubscribe/:token" component={GoalUnsubscribe} />
        </UserMessagesProvider>
      </AppProvider>
    );
    history.push('/goal-unsubscribe/TOKEN'); // so we can pull token from url
  });

  it('starts with a spinner', () => {
    render(component);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads a real token', async () => {
    const response = { course_title: 'My Sample Course' };
    axiosMock.onPost(unsubscribeUrl).reply(200, response);
    await act(async () => render(component));

    expect(screen.getByText('You’ve unsubscribed from goal reminders')).toBeInTheDocument();
    expect(screen.getByText(/your goal for My Sample Course/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to dashboard' }))
      .toHaveAttribute('href', 'http://localhost:18000/dashboard');
  });

  it('loads a bad token with an error page', async () => {
    axiosMock.onPost(unsubscribeUrl).reply(404, {});
    await act(async () => render(component));

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to dashboard' }))
      .toHaveAttribute('href', 'http://localhost:18000/dashboard');
    expect(screen.getByRole('link', { name: 'contact support' }))
      .toHaveAttribute('href', 'http://localhost:18000/contact');
  });
});

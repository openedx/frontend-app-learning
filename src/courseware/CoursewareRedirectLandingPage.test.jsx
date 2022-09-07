import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import CoursewareRedirectLandingPage from './CoursewareRedirectLandingPage';

const redirectUrl = jest.fn();

jest.mock('@edx/frontend-platform/analytics');

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useRouteMatch: () => ({
    path: '/redirect',
  }),
}));

describe('CoursewareRedirectLandingPage', () => {
  beforeEach(async () => {
    delete global.location;
    global.location = { assign: redirectUrl };
  });

  it('Redirects to correct consent URL', () => {
    const history = createMemoryHistory({
      initialEntries: ['/redirect/consent/?consentPath=%2Fgrant_data_sharing_consent'],
    });

    render(
      <Router history={history}>
        <CoursewareRedirectLandingPage />
      </Router>,
    );

    expect(redirectUrl).toHaveBeenCalledWith('http://localhost:18000/grant_data_sharing_consent');
  });

  it('Redirects to correct consent URL', () => {
    const history = createMemoryHistory({
      initialEntries: ['/redirect/home/course-v1:edX+DemoX+Demo_Course'],
    });

    render(
      <Router history={history}>
        <CoursewareRedirectLandingPage />
      </Router>,
    );

    expect(redirectUrl).toHaveBeenCalledWith('/course/course-v1:edX+DemoX+Demo_Course/home');
  });
});

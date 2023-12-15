import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import { mergeConfig } from '@edx/frontend-platform';
import { render, initializeMockApp } from '../setupTest';
import CoursewareRedirectLandingPage from './CoursewareRedirectLandingPage';

const redirectUrl = jest.fn();

jest.mock('@edx/frontend-platform/analytics');
jest.mock('../decode-page-route', () => jest.fn(({ children }) => <div>{children}</div>));

describe('CoursewareRedirectLandingPage', () => {
  beforeEach(async () => {
    await initializeMockApp();
    mergeConfig({
      ENTERPRISE_LEARNER_PORTAL_URL: 'http://localhost:8734',
    }, 'Add configs for URLs');
    delete global.location;
    global.location = { assign: redirectUrl };
  });

  it('Redirects to correct consent URL', () => {
    render(
      <Router initialEntries={['/consent/?consentPath=%2Fgrant_data_sharing_consent']}>
        <CoursewareRedirectLandingPage />
      </Router>,
    );

    expect(redirectUrl).toHaveBeenCalledWith('http://localhost:18000/grant_data_sharing_consent');
  });

  it('Redirects to correct consent URL', () => {
    render(
      <Router initialEntries={['/home/course-v1:edX+DemoX+Demo_Course']}>
        <CoursewareRedirectLandingPage />
      </Router>,
    );

    expect(redirectUrl).toHaveBeenCalledWith('/course/course-v1:edX+DemoX+Demo_Course/home');
  });

  it('Redirects to correct enterprise dashboard URL', () => {
    render(
      <Router initialEntries={['/enterprise-learner-dashboard']}>
        <CoursewareRedirectLandingPage />
      </Router>,
    );

    expect(redirectUrl).toHaveBeenCalledWith('http://localhost:8734');
  });
});

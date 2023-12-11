import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { PageWrap } from '@edx/frontend-platform/react';

import PageLoading from '../generic/PageLoading';

import DecodePageRoute from '../decode-page-route';
import { DECODE_ROUTES, REDIRECT_MODES, ROUTES } from '../constants';
import RedirectPage from './RedirectPage';

const CoursewareRedirectLandingPage = () => (
  <div className="flex-grow-1">
    <PageLoading srMessage={(
      <FormattedMessage
        id="learn.redirect.interstitial.message"
        description="The screen-reader message when a page is about to redirect"
        defaultMessage="Redirecting..."
      />
      )}
    />

    <Routes>
      <Route
        path={DECODE_ROUTES.REDIRECT_SURVEY}
        element={<DecodePageRoute><RedirectPage pattern="/courses/:courseId/survey" mode={REDIRECT_MODES.SURVEY_REDIRECT} /></DecodePageRoute>}
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={<PageWrap><RedirectPage pattern="/dashboard" mode={REDIRECT_MODES.DASHBOARD_REDIRECT} /></PageWrap>}
      />
      <Route
        path={ROUTES.ENTERPRISE_LEARNER_DASHBOARD}
        element={<PageWrap><RedirectPage mode={REDIRECT_MODES.ENTERPRISE_LEARNER_DASHBOARD_REDIRECT} /></PageWrap>}
      />
      <Route
        path={ROUTES.CONSENT}
        element={<PageWrap><RedirectPage mode={REDIRECT_MODES.CONSENT_REDIRECT} /></PageWrap>}
      />
      <Route
        path={DECODE_ROUTES.REDIRECT_HOME}
        element={<DecodePageRoute><RedirectPage pattern="/course/:courseId/home" mode={REDIRECT_MODES.HOME_REDIRECT} /></DecodePageRoute>}
      />
    </Routes>
  </div>
);

export default CoursewareRedirectLandingPage;

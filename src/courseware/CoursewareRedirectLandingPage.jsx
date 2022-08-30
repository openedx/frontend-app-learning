import React from 'react';
import { Switch, useRouteMatch } from 'react-router';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { PageRoute } from '@edx/frontend-platform/react';

import queryString from 'query-string';
import PageLoading from '../generic/PageLoading';

export default () => {
  const { path } = useRouteMatch();
  return (
    <div className="flex-grow-1">
      <PageLoading srMessage={(
        <FormattedMessage
          id="learn.redirect.interstitial.message"
          description="The screen-reader message when a page is about to redirect"
          defaultMessage="Redirecting..."
        />
      )}
      />

      <Switch>
        <PageRoute
          path={`${path}/survey/:courseId`}
          render={({ match }) => {
            global.location.assign(`${getConfig().LMS_BASE_URL}/courses/${match.params.courseId}/survey`);
          }}
        />
        <PageRoute
          path={`${path}/dashboard`}
          render={({ location }) => {
            global.location.assign(`${getConfig().LMS_BASE_URL}/dashboard${location.search}`);
          }}
        />
        <PageRoute
          path={`${path}/consent/`}
          render={({ location }) => {
            const { consentPath } = queryString.parse(location.search);
            global.location.assign(`${getConfig().LMS_BASE_URL}${consentPath}`);
          }}
        />
        <PageRoute
          path={`${path}/home/:courseId`}
          render={({ match }) => {
            global.location.assign(`/course/${match.params.courseId}/home`);
          }}
        />
      </Switch>
    </div>
  );
};

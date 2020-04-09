import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PageLoading from './PageLoading';

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
        <Route
          path={`${path}/course-home/:courseId`}
          render={({ match }) => {
            global.location.assign(`${getConfig().LMS_BASE_URL}/courses/${match.params.courseId}/course/`);
          }}
        />
        <Route
          path={`${path}/dashboard`}
          render={({ location }) => {
            global.location.assign(`${getConfig().LMS_BASE_URL}/dashboard${location.search}`);
          }}
        />
      </Switch>
    </div>
  );
};

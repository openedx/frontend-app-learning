import React from 'react';
import { Switch, useRouteMatch } from 'react-router';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { PageRoute } from '@edx/frontend-platform/react';

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
          path={`${path}/courseware/:courseId/unit/:unitId`}
          render={({ match }) => {
            global.location.assign(`${getConfig().LMS_BASE_URL}/courses/${match.params.courseId}/jump_to/${match.params.unitId}?experience=legacy`);
          }}
        />
        <PageRoute
          path={`${path}/course-home/:courseId`}
          render={({ match }) => {
            global.location.assign(`${getConfig().LMS_BASE_URL}/courses/${match.params.courseId}/course/`);
          }}
        />
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
      </Switch>
    </div>
  );
};

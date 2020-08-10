import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PageLoading from './generic/PageLoading';
import { useModel } from './generic/model-store';

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
          path={`${path}/unit/:unitId`}
          render={({ match }) => {
            const { unitId } = match.params;
            const unit = useModel('units', unitId);

            const lmsWebUrl = unit !== undefined ? unit.lmsWebUrl : null;
            if (lmsWebUrl) {
              global.location.assign(lmsWebUrl);
            }
          }}
        />
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

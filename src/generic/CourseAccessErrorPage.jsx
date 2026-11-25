import React from 'react';
import { getUrlByRouteRole, useIntl } from '@openedx/frontend-base';
import { Navigate } from 'react-router-dom';

import { learningRole } from '@src/constants';
import useActiveEnterpriseAlert from '../alerts/active-enteprise-alert';
import { AlertList } from './user-messages';
import { useCourseHomeMeta } from '../course-home/data/apiHooks';
import PageLoading from './PageLoading';
import messages from '../tab-page/messages';
import { useCourseId } from '@src/generic/course-params';

const CourseAccessErrorPage = () => {
  const intl = useIntl();
  const courseId = useCourseId();

  const activeEnterpriseAlert = useActiveEnterpriseAlert(courseId);
  const metadataQuery = useCourseHomeMeta(courseId);

  if (metadataQuery.isPending) {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages.loading)}
      />
    );
  }
  if (metadataQuery.data?.courseAccess?.hasAccess) {
    return <Navigate to={`${getUrlByRouteRole(learningRole)}/redirect/home/${courseId}`} replace />;
  }
  return (
    <main className="container my-5 text-center" data-testid="access-denied-main">
      <AlertList
        topic="outline"
        className="mx-5 mt-3"
        customAlerts={{
          ...activeEnterpriseAlert,
        }}
      />
    </main>
  );
};

export default CourseAccessErrorPage;

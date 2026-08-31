import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FooterSlot } from '@edx/frontend-component-footer';
import HeaderSlot from '../plugin-slots/HeaderSlot';
import useActiveEnterpriseAlert from '../alerts/active-enteprise-alert';
import { AlertList } from './user-messages';
import { useCourseHomeMeta } from '../course-home/data/apiHooks';
import PageLoading from './PageLoading';
import messages from '../tab-page/messages';

const CourseAccessErrorPage = () => {
  const intl = useIntl();
  const { courseId } = useParams();

  const activeEnterpriseAlert = useActiveEnterpriseAlert(courseId);
  const metadataQuery = useCourseHomeMeta(courseId, 'outline');

  if (metadataQuery.isPending) {
    return (
      <>
        <HeaderSlot />
        <PageLoading
          srMessage={intl.formatMessage(messages.loading)}
        />
        <FooterSlot />
      </>
    );
  }
  if (metadataQuery.data?.courseAccess?.hasAccess) {
    return <Navigate to={`/redirect/home/${courseId}`} replace />;
  }
  return (
    <>
      <HeaderSlot />
      <main id="main-content" className="container my-5 text-center" data-testid="access-denied-main">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={{
            ...activeEnterpriseAlert,
          }}
        />
      </main>
      <FooterSlot />
    </>
  );
};

export default CourseAccessErrorPage;

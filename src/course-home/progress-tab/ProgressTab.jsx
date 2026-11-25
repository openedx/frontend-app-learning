import React, { useEffect } from 'react';
import { getSiteConfig, useIntl } from '@openedx/frontend-base';
import { useWindowSize } from '@openedx/paragon';
import PropTypes from 'prop-types';

import ProgressTabCertificateStatusMainBodySlot from '@src/slots/ProgressTabCertificateStatusMainBodySlot';
import ProgressTabCertificateStatusSidePanelSlot from '@src/slots/ProgressTabCertificateStatusSidePanelSlot';
import ProgressTabCourseCompletionSlot from '@src/slots/ProgressTabCourseCompletionSlot';
import ProgressTabCourseGradeSlot from '@src/slots/ProgressTabCourseGradeSlot';
import ProgressTabGradeBreakdownSlot from '@src/slots/ProgressTabGradeBreakdownSlot';
import ProgressTabRelatedLinksSlot from '@src/slots/ProgressTabRelatedLinksSlot';
import { getResponseStatus } from '@src/data/http-error';
import PageLoading from '@src/generic/PageLoading';
import tabPageMessages from '@src/tab-page/messages';
import ProgressHeader from './ProgressHeader';
import { useProgressData } from './hooks';
import { useCourseHomeMeta, useProgressTabData } from '../data/apiHooks';
import { useAccessExpirationMasqueradeBanner } from '../../alerts/access-expiration-alert';
import { useCourseStartMasqueradeBanner } from '../../alerts/course-start-alert';
import { TabWithTimer } from '../../tab-page';
import { CourseParamsProvider, useCourseId } from '../../generic/course-params';
import LearningWidgetProviders from '../../generic/LearningWidgetProviders';

const ProgressTabContent = () => {
  const courseId = useCourseId();
  const { disableProgressGraph } = useProgressData();

  const windowWidth = useWindowSize().width;
  if (windowWidth === undefined) {
    // Bail because we don't want to load <CertificateStatus/> twice, emitting 'visited' events both times.
    // This is a hacky solution, since the user can resize the screen and still get two visited events.
    // But I'm leaving a larger refactor as an exercise to a future reader.
    return null;
  }

  return (
    <>
      <ProgressHeader />
      <div className="row w-100 m-0">
        {/* Main body */}
        <div className="col-12 col-md-8 p-0">
          <ProgressTabCourseCompletionSlot courseId={courseId} enableProgressGraph={!disableProgressGraph} />
          <ProgressTabCertificateStatusMainBodySlot courseId={courseId} />
          <ProgressTabCourseGradeSlot courseId={courseId} />
          <ProgressTabGradeBreakdownSlot courseId={courseId} />
        </div>

        {/* Side panel */}
        <div className="col-12 col-md-4 p-0 px-md-4">
          <ProgressTabCertificateStatusSidePanelSlot courseId={courseId} />
          <ProgressTabRelatedLinksSlot courseId={courseId} />
        </div>
      </div>
    </>
  );
};

// Under the providers ProgressTab mounts: the banner hooks register with its user messages.
const ProgressTabFrame = ({ courseId, targetUserId = undefined }) => {
  const intl = useIntl();
  const metadataQuery = useCourseHomeMeta(courseId);
  const tabDataQuery = useProgressTabData(courseId, targetUserId);
  const redirectToLegacyProgress = getResponseStatus(tabDataQuery.error) === 404;

  const accessExpirationMasqueradeBanner = useAccessExpirationMasqueradeBanner(
    courseId,
    tabDataQuery.data?.accessExpiration,
  );
  const courseStartMasqueradeBanner = useCourseStartMasqueradeBanner(courseId);

  useEffect(() => {
    if (redirectToLegacyProgress) {
      global.location.replace(`${getSiteConfig().lmsBaseUrl}/courses/${courseId}/progress`);
    }
  }, [redirectToLegacyProgress, courseId]);

  if (redirectToLegacyProgress) {
    return <PageLoading srMessage={intl.formatMessage(tabPageMessages.loading)} />;
  }
  return (
    <CourseParamsProvider courseId={courseId} targetUserId={targetUserId}>
      <TabWithTimer
        courseId={courseId}
        courseStatus={{ metadataQuery, tabDataQuery }}
        masqueradeBanners={{ ...accessExpirationMasqueradeBanner, ...courseStartMasqueradeBanner }}
      >
        <ProgressTabContent />
      </TabWithTimer>
    </CourseParamsProvider>
  );
};

ProgressTabFrame.propTypes = {
  courseId: PropTypes.string.isRequired,
  targetUserId: PropTypes.string,
};

/** @param {{ courseId: string, targetUserId?: string }} props */
const ProgressTab = ({ courseId, targetUserId = undefined }) => (
  <LearningWidgetProviders>
    <ProgressTabFrame courseId={courseId} targetUserId={targetUserId} />
  </LearningWidgetProviders>
);

ProgressTab.propTypes = {
  courseId: PropTypes.string.isRequired,
  targetUserId: PropTypes.string,
};

export default ProgressTab;

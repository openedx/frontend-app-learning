import React, { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useWindowSize } from '@openedx/paragon';
import { useParams } from 'react-router-dom';

import ProgressTabCertificateStatusMainBodySlot from '@src/plugin-slots/ProgressTabCertificateStatusMainBodySlot';
import ProgressTabCertificateStatusSidePanelSlot from '@src/plugin-slots/ProgressTabCertificateStatusSidePanelSlot';
import ProgressTabCourseCompletionSlot from '@src/plugin-slots/ProgressTabCourseCompletionSlot';
import ProgressTabCourseGradeSlot from '@src/plugin-slots/ProgressTabCourseGradeSlot';
import ProgressTabGradeBreakdownSlot from '@src/plugin-slots/ProgressTabGradeBreakdownSlot';
import ProgressTabRelatedLinksSlot from '@src/plugin-slots/ProgressTabRelatedLinksSlot';
import { getResponseStatus } from '@src/data/http-error';
import PageLoading from '@src/generic/PageLoading';
import tabPageMessages from '@src/tab-page/messages';
import ProgressHeader from './ProgressHeader';
import { useProgressData } from './hooks';
import { useCourseHomeMeta, useProgressTabData } from '../data/apiHooks';
import { TabWithTimer } from '../../tab-page';

const ProgressTabContent = () => {
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
          <ProgressTabCourseCompletionSlot enableProgressGraph={!disableProgressGraph} />
          <ProgressTabCertificateStatusMainBodySlot />
          <ProgressTabCourseGradeSlot />
          <ProgressTabGradeBreakdownSlot />
        </div>

        {/* Side panel */}
        <div className="col-12 col-md-4 p-0 px-md-4">
          <ProgressTabCertificateStatusSidePanelSlot />
          <ProgressTabRelatedLinksSlot />
        </div>
      </div>
    </>
  );
};

const ProgressTab = () => {
  const intl = useIntl();
  const { courseId, targetUserId } = useParams();
  const metadataQuery = useCourseHomeMeta(courseId);
  const tabDataQuery = useProgressTabData(courseId, targetUserId);
  const redirectToLegacyProgress = getResponseStatus(tabDataQuery.error) === 404;

  useEffect(() => {
    if (redirectToLegacyProgress) {
      global.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/progress`);
    }
  }, [redirectToLegacyProgress, courseId]);

  if (redirectToLegacyProgress) {
    return <PageLoading srMessage={intl.formatMessage(tabPageMessages.loading)} />;
  }
  return (
    <TabWithTimer
      activeTabSlug="progress"
      courseId={courseId}
      courseStatus={{ metadataQuery, tabDataQuery }}
    >
      <ProgressTabContent />
    </TabWithTimer>
  );
};

export default ProgressTab;

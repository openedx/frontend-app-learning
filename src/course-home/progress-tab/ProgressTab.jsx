import React, { useMemo } from 'react';
import { useWindowSize } from '@openedx/paragon';
import { useModel } from '@src/generic/model-store';
import { useParams } from 'react-router-dom';

import ProgressTabCertificateStatusMainBodySlot from '@src/plugin-slots/ProgressTabCertificateStatusMainBodySlot';
import ProgressTabCertificateStatusSidePanelSlot from '@src/plugin-slots/ProgressTabCertificateStatusSidePanelSlot';
import ProgressTabCourseCompletionSlot from '@src/plugin-slots/ProgressTabCourseCompletionSlot';
import ProgressTabCourseGradeSlot from '@src/plugin-slots/ProgressTabCourseGradeSlot';
import ProgressTabGradeBreakdownSlot from '@src/plugin-slots/ProgressTabGradeBreakdownSlot';
import ProgressTabRelatedLinksSlot from '@src/plugin-slots/ProgressTabRelatedLinksSlot';
import ProgressHeader from './ProgressHeader';
import { useGetExamsData, useProgressData } from './hooks';
import { useCourseHomeMeta, useProgressTabData } from '../data/apiHooks';
import { TabWithTimer } from '../../tab-page';

const ProgressTabContent = () => {
  const { courseId } = useParams();
  const { sectionScores, disableProgressGraph } = useProgressData();

  const sequenceIds = useMemo(() => (
    sectionScores.flatMap((section) => (section.subsections)).map((subsection) => subsection.blockKey)
  ), [sectionScores]);

  useGetExamsData(courseId, sequenceIds);

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
  const { courseId, targetUserId } = useParams();
  const metadataQuery = useCourseHomeMeta(courseId, 'outline');
  const tabDataQuery = useProgressTabData(courseId, targetUserId);

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

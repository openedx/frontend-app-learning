import React from 'react';
import { useSelector } from 'react-redux';
import { breakpoints, useWindowSize } from '@openedx/paragon';

import CourseCompletion from './course-completion/CourseCompletion';
import ProgressHeader from './ProgressHeader';

import ProgressTabCertificateStatusSlot from '../../plugin-slots/ProgressTabCertificateStatusSlot';
import ProgressTabCourseGradeSlot from '../../plugin-slots/ProgressTabCourseGradeSlot';
import ProgressTabDetailedGradesSlot from '../../plugin-slots/ProgressTabDetailedGradesSlot';
import ProgressTabGradeSummarySlot from '../../plugin-slots/ProgressTabGradeSummarySlot';
import ProgressTabRelatedLinksSlot from '../../plugin-slots/ProgressTabRelatedLinksSlot';
import { useModel } from '../../generic/model-store';

const ProgressTab = () => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradesFeatureIsFullyLocked, disableProgressGraph,
  } = useModel('progress', courseId);

  const applyLockedOverlay = gradesFeatureIsFullyLocked ? 'locked-overlay' : '';

  const windowWidth = useWindowSize().width;
  if (windowWidth === undefined) {
    // Bail because we don't want to load <CertificateStatus/> twice, emitting 'visited' events both times.
    // This is a hacky solution, since the user can resize the screen and still get two visited events.
    // But I'm leaving a larger refactor as an exercise to a future reader.
    return null;
  }

  const wideScreen = windowWidth >= breakpoints.large.minWidth;
  return (
    <>
      <ProgressHeader />
      <div className="row w-100 m-0">
        {/* Main body */}
        <div className="col-12 col-md-8 p-0">
          {!disableProgressGraph && <CourseCompletion />}
          {!wideScreen && <ProgressTabCertificateStatusSlot courseId={courseId} />}
          <ProgressTabCourseGradeSlot courseId={courseId} />
          <div className={`grades my-4 p-4 rounded raised-card ${applyLockedOverlay}`} aria-hidden={gradesFeatureIsFullyLocked}>
            <ProgressTabGradeSummarySlot courseId={courseId} />
            <ProgressTabDetailedGradesSlot courseId={courseId} />
          </div>
        </div>

        {/* Side panel */}
        <div className="col-12 col-md-4 p-0 px-md-4">
          {wideScreen && <ProgressTabCertificateStatusSlot courseId={courseId} />}
          <ProgressTabRelatedLinksSlot courseId={courseId} />
        </div>
      </div>
    </>
  );
};

export default ProgressTab;

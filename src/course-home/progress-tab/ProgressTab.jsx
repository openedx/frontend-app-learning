import React from 'react';
import { useWindowSize } from '@openedx/paragon';
import { useContextId } from '../../data/hooks';
import ProgressTabCertificateStatusSidePanelSlot from '../../plugin-slots/ProgressTabCertificateStatusSidePanelSlot';

import CourseCompletion from './course-completion/CourseCompletion';
import ProgressHeader from './ProgressHeader';

import ProgressTabCertificateStatusMainBodySlot from '../../plugin-slots/ProgressTabCertificateStatusMainBodySlot';
import ProgressTabCourseGradeSlot from '../../plugin-slots/ProgressTabCourseGradeSlot';
import ProgressTabGradeBreakdownSlot from '../../plugin-slots/ProgressTabGradeBreakdownSlot';
import ProgressTabRelatedLinksSlot from '../../plugin-slots/ProgressTabRelatedLinksSlot';
import { useModel } from '../../generic/model-store';

const ProgressTab = () => {
  const courseId = useContextId();
  const { disableProgressGraph } = useModel('progress', courseId);

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
          {!disableProgressGraph && <CourseCompletion />}
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

export default ProgressTab;

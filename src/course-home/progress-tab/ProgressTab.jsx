import React from 'react';
import { layoutGenerator } from 'react-break';
import { useSelector } from 'react-redux';

import CertificateStatus from './certificate-status/CertificateStatus';
import CourseCompletion from './course-completion/CourseCompletion';
import CourseGrade from './grades/course-grade/CourseGrade';
import DetailedGrades from './grades/detailed-grades/DetailedGrades';
import GradeSummary from './grades/grade-summary/GradeSummary';
import ProgressHeader from './ProgressHeader';
import RelatedLinks from './related-links/RelatedLinks';

import { useModel } from '../../generic/model-store';

function ProgressTab() {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);

  const applyLockedOverlay = gradesFeatureIsFullyLocked ? 'locked-overlay' : '';

  const layout = layoutGenerator({
    mobile: 0,
    desktop: 992,
  });

  const OnMobile = layout.is('mobile');
  const OnDesktop = layout.isAtLeast('desktop');
  return (
    <>
      <ProgressHeader />
      <div className="row w-100 m-0">
        {/* Main body */}
        <div className="col-12 col-md-8 p-0">
          <CourseCompletion />
          <OnMobile>
            <CertificateStatus />
          </OnMobile>
          <CourseGrade />
          <div className={`grades my-4 p-4 rounded shadow-sm ${applyLockedOverlay}`} aria-hidden={gradesFeatureIsFullyLocked}>
            <GradeSummary />
            <DetailedGrades />
          </div>
        </div>

        {/* Side panel */}
        <div className="col-12 col-md-4 p-0 px-md-4">
          <OnDesktop>
            <CertificateStatus />
          </OnDesktop>
          <RelatedLinks />
        </div>
      </div>
    </>
  );
}

export default ProgressTab;

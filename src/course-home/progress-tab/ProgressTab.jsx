import React, { useEffect } from 'react';
import { layoutGenerator } from 'react-break';
import { useDispatch, useSelector } from 'react-redux';

import CertificateStatus from './certificate-status/CertificateStatus';
import CourseCompletion from './course-completion/CourseCompletion';
import CourseGrade from './grades/course-grade/CourseGrade';
import DetailedGrades from './grades/detailed-grades/DetailedGrades';
import GradeSummary from './grades/grade-summary/GradeSummary';
import ProgressHeader from './ProgressHeader';
import RelatedLinks from './related-links/RelatedLinks';

import { setGradesFeatureStatus } from '../data/slice';
import { useModel } from '../../generic/model-store';

function ProgressTab() {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    completionSummary: {
      lockedCount,
    },
  } = useModel('progress', courseId);

  const gradesFeatureIsLocked = lockedCount > 0;
  const applyLockedOverlay = gradesFeatureIsLocked ? 'locked-overlay' : '';

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setGradesFeatureStatus({ gradesFeatureIsLocked }));
  }, []);

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
          <div className={`grades my-4 p-4 rounded shadow-sm ${applyLockedOverlay}`} aria-hidden={gradesFeatureIsLocked}>
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

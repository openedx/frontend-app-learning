import React from 'react';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useModel } from '../../../../generic/model-store';

import CourseGradeFooter from './CourseGradeFooter';
import CourseGradeHeader from './CourseGradeHeader';
import GradeBar from './GradeBar';

import messages from '../messages';

function CourseGrade({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradesFeatureIsFullyLocked,
    gradesFeatureIsPartiallyLocked,
    gradingPolicy: {
      gradeRange,
    },
  } = useModel('progress', courseId);

  const passingGrade = Number((Math.min(...Object.values(gradeRange)) * 100).toFixed(0));

  const applyLockedOverlay = gradesFeatureIsFullyLocked ? 'locked-overlay' : '';

  return (
    <section className="text-dark-700 my-4 rounded shadow-sm">
      {(gradesFeatureIsFullyLocked || gradesFeatureIsPartiallyLocked) && <CourseGradeHeader />}
      <div className={applyLockedOverlay} aria-hidden={gradesFeatureIsFullyLocked}>
        <div className="row w-100 m-0 p-4">
          <div className="col-12 col-sm-6 p-0 pr-sm-2">
            <h2>{intl.formatMessage(messages.grades)}</h2>
            <p className="small">
              {intl.formatMessage(messages.courseGradeBody)}
            </p>
          </div>
          <GradeBar passingGrade={passingGrade} />
        </div>
        <CourseGradeFooter passingGrade={passingGrade} />
      </div>
    </section>
  );
}

CourseGrade.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseGrade);

import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { CheckCircle, WarningFilled } from '@edx/paragon/icons';
import { breakpoints, Icon, useWindowSize } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

import GradeRangeTooltip from './GradeRangeTooltip';
import messages from '../messages';

function CourseGradeFooter({ intl, passingGrade }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    courseGrade: {
      isPassing,
      letterGrade,
    },
    gradingPolicy: {
      gradeRange,
    },
  } = useModel('progress', courseId);

  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;

  const hasLetterGrades = Object.keys(gradeRange).length > 1; // A pass/fail course will only have one key
  let footerText = intl.formatMessage(messages.courseGradeFooterNonPassing, { passingGrade });

  if (isPassing) {
    if (hasLetterGrades) {
      const minGradeRangeCutoff = gradeRange[letterGrade] * 100;
      const possibleMaxGradeRangeValues = [...Object.values(gradeRange).filter(
        (grade) => (grade * 100 > minGradeRangeCutoff),
      )];
      const maxGradeRangeCutoff = possibleMaxGradeRangeValues.length ? Math.min(...possibleMaxGradeRangeValues) * 100
        : 100;

      footerText = intl.formatMessage(messages.courseGradeFooterPassingWithGrade, {
        letterGrade,
        minGrade: minGradeRangeCutoff.toFixed(0),
        maxGrade: maxGradeRangeCutoff.toFixed(0),
      });
    } else {
      footerText = intl.formatMessage(messages.courseGradeFooterGenericPassing);
    }
  }

  const icon = isPassing ? <Icon src={CheckCircle} className="text-success-300 d-inline-flex align-bottom" />
    : <Icon src={WarningFilled} className="d-inline-flex align-bottom" />;

  return (
    <div className={`row w-100 m-0 px-4 py-3 py-md-4 rounded-bottom ${isPassing ? 'bg-success-100' : 'bg-warning-100'}`}>
      <div className="col-auto p-0">
        {icon}
      </div>
      <div className="col-11 pl-2 px-0">
        {!wideScreen && (
          <span className="h5 align-bottom">
            {footerText}
            {hasLetterGrades && (
              <span style={{ whiteSpace: 'nowrap' }}>
                &nbsp;
                <GradeRangeTooltip iconButtonClassName="h4" passingGrade={passingGrade} />
              </span>
            )}
          </span>
        )}
        {wideScreen && (
          <span className="h4 m-0 align-bottom">
            {footerText}
            {hasLetterGrades && (
              <span style={{ whiteSpace: 'nowrap' }}>
                &nbsp;
                <GradeRangeTooltip iconButtonClassName="h3" passingGrade={passingGrade} />
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

CourseGradeFooter.propTypes = {
  intl: intlShape.isRequired,
  passingGrade: PropTypes.number.isRequired,
};

export default injectIntl(CourseGradeFooter);

import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { layoutGenerator } from 'react-break';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { CheckCircle, WarningFilled } from '@edx/paragon/icons';
import { Icon } from '@edx/paragon';
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

  const layout = layoutGenerator({
    mobile: 0,
    tablet: 768,
  });

  const OnMobile = layout.is('mobile');
  const OnAtLeastTablet = layout.isAtLeast('tablet');

  const hasLetterGrades = !gradeRange.pass;
  let footerText = intl.formatMessage(messages.courseGradeFooterNonPassing, { passingGrade });

  if (isPassing) {
    if (hasLetterGrades) {
      const letterGrades = Object.keys(gradeRange);
      const gradeIndex = letterGrades.indexOf(letterGrade);
      const minGrade = gradeRange[letterGrade] * 100;
      const maxGrade = gradeIndex > 0 ? gradeRange[letterGrades[gradeIndex - 1]] * 100 : 100;

      footerText = intl.formatMessage(messages.courseGradeFooterPassingWithGrade, {
        letterGrade,
        minGrade: minGrade.toFixed(0),
        maxGrade: maxGrade.toFixed(0),
      });
    } else {
      footerText = intl.formatMessage(messages.courseGradeFooterGenericPassing);
    }
  }

  const footerHtml = (
    <>
      <OnMobile>
        <span className="h5">{footerText}</span>
      </OnMobile>
      <OnAtLeastTablet>
        <span className="h4">{footerText}</span>
      </OnAtLeastTablet>
    </>
  );

  return (
    <div className={`row w-100 m-0 px-4 py-3 py-md-4 rounded-bottom ${isPassing ? 'bg-success-100' : 'bg-warning-100'}`}>
      <div className="col-1 col-md-auto pl-0 pr-2 align-self-top">
        {isPassing && (
          <Icon src={CheckCircle} className="text-success-300" />
        )}
        {!isPassing && (
          <Icon src={WarningFilled} />
        )}
      </div>
      <div className="col-11 p-0">
        {!hasLetterGrades && footerHtml}
        {hasLetterGrades && (
          <div className="row w-100 m-0 flex-nowrap">
            <div className="col-11 col-md-auto m-0 p-0">
              {footerHtml}
            </div>
            <GradeRangeTooltip passingGrade={passingGrade} />
          </div>
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

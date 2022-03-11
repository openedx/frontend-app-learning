import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useModel } from '../../../../generic/model-store';
import CurrentGradeTooltip from './CurrentGradeTooltip';
import PassingGradeTooltip from './PassingGradeTooltip';

import messages from '../messages';

function GradeBar({ intl, passingGrade }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    courseGrade: {
      isPassing,
      percent,
    },
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);

  const currentGrade = Number((percent * 100).toFixed(0));

  const lockedTooltipClassName = gradesFeatureIsFullyLocked ? 'locked-overlay' : '';

  return (
    <div className="col-12 col-sm-6 align-self-center p-0">
      <div className="sr-only">{intl.formatMessage(messages.courseGradeBarAltText, { currentGrade, passingGrade })}</div>
      <svg width="100%" height="100px" className="grade-bar" aria-hidden="true">
        <g style={{ transform: 'translateY(2.61em)' }}>
          <rect className="grade-bar__base" width="100%" />
          <rect className="grade-bar--passing" width={`${passingGrade}%`} />
          <rect className={`grade-bar--current-${isPassing ? 'passing' : 'non-passing'}`} width={`${currentGrade}%`} />

          {/* Start divider */}
          <rect className="grade-bar__divider" />
          {/* End divider */}
          <rect className="grade-bar__divider" x="99.7%" />
        </g>
        <PassingGradeTooltip passingGrade={passingGrade} tooltipClassName={lockedTooltipClassName} />
        <CurrentGradeTooltip tooltipClassName={lockedTooltipClassName} />
      </svg>
    </div>
  );
}

GradeBar.propTypes = {
  intl: intlShape.isRequired,
  passingGrade: PropTypes.number.isRequired,
};

export default injectIntl(GradeBar);

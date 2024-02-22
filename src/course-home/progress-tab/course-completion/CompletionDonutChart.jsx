import React from 'react';
import { useSelector } from 'react-redux';
import {
  getLocale, injectIntl, intlShape, isRtl,
} from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { useModel } from '../../../generic/model-store';

import CompleteDonutSegment from './CompleteDonutSegment';
import IncompleteDonutSegment from './IncompleteDonutSegment';
import LockedDonutSegment from './LockedDonutSegment';
import messages from './messages';

const CompletionDonutChart = ({ intl, optional }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const key = optional ? 'optionalCompletionSummary' : 'completionSummary';
  const label = optional ? intl.formatMessage(messages.optionalDonutLabel) : intl.formatMessage(messages.donutLabel);

  const progress = useModel('progress', courseId);
  const {
    completeCount,
    incompleteCount,
    lockedCount,
  } = progress[key];

  const numTotalUnits = completeCount + incompleteCount + lockedCount;
  const completePercentage = completeCount ? Number(((completeCount / numTotalUnits) * 100).toFixed(0)) : 0;
  const lockedPercentage = lockedCount ? Number(((lockedCount / numTotalUnits) * 100).toFixed(0)) : 0;
  const incompletePercentage = 100 - completePercentage - lockedPercentage;

  const isLocaleRtl = isRtl(getLocale());

  if (optional && numTotalUnits === 0) {
    return <></>;
  }

  return (
    <>
      <svg role="img" width="50%" height="100%" viewBox="0 0 42 42" className="donut" style={{ maxWidth: '178px' }} aria-hidden="true">
        {/* The radius (or "r" attribute) is based off of a circumference of 100 in order to simplify percentage
            calculations. The subsequent stroke-dasharray values found in each segment should add up to equal 100
            in order to wrap around the circle once. */}
        <circle className="donut-hole" fill="#fff" cx="21" cy="21" r="15.91549430918954" />
        <g className="donut-chart-text">
          <text x="50%" y="50%" className="donut-chart-number">
            {completePercentage}{isLocaleRtl && '\u200f'}%
          </text>
          <text x="50%" y="50%" className="donut-chart-label">
            {label}
          </text>
        </g>
        <IncompleteDonutSegment incompletePercentage={incompletePercentage} />
        <LockedDonutSegment lockedPercentage={lockedPercentage} />
        <CompleteDonutSegment completePercentage={completePercentage} lockedPercentage={lockedPercentage} />
      </svg>
      <div className="sr-only">
        {intl.formatMessage(messages.percentComplete, { percent: completePercentage })}
        {intl.formatMessage(messages.percentIncomplete, { percent: incompletePercentage })}
        {lockedPercentage > 0 && (
          <>
            {intl.formatMessage(messages.percentLocked, { percent: lockedPercentage })}
          </>
        )}
      </div>
    </>
  );
};

CompletionDonutChart.defaultProps = {
  optional: false,
};

CompletionDonutChart.propTypes = {
  intl: intlShape.isRequired,
  optional: PropTypes.bool,
};

export default injectIntl(CompletionDonutChart);

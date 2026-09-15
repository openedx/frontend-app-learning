import { getConfig } from '@edx/frontend-platform';
import { getLocale, isRtl, useIntl } from '@edx/frontend-platform/i18n';
import { useProgressData } from '../hooks';

import CompleteDonutSegment from './CompleteDonutSegment';
import IncompleteDonutSegment from './IncompleteDonutSegment';
import LockedDonutSegment from './LockedDonutSegment';
import messages from './messages';

const CompletionDonutChart = () => {
  const intl = useIntl();

  const {
    completionSummary: {
      completeCount,
      incompleteCount,
      lockedCount,
    },
  } = useProgressData();

  const precision = Number(getConfig().COMPLETION_PERCENTAGE_PRECISION) || 0;
  const toPercentage = (count, total) => Number(((count / total) * 100).toFixed(precision));
  const formatPercentage = (percentage) => intl.formatNumber(percentage, { maximumFractionDigits: precision });

  const numTotalUnits = completeCount + incompleteCount + lockedCount;
  const completePercentage = completeCount ? toPercentage(completeCount, numTotalUnits) : 0;
  const lockedPercentage = lockedCount ? toPercentage(lockedCount, numTotalUnits) : 0;
  const incompletePercentage = Number((100 - completePercentage - lockedPercentage).toFixed(precision));

  const isLocaleRtl = isRtl(getLocale());

  return (
    <>
      <svg role="img" width="50%" height="100%" viewBox="0 0 42 42" className="donut" style={{ maxWidth: '178px' }} aria-hidden="true">
        {/* The radius (or "r" attribute) is based off of a circumference of 100 in order to simplify percentage
            calculations. The subsequent stroke-dasharray values found in each segment should add up to equal 100
            in order to wrap around the circle once. */}
        <circle className="donut-hole" fill="#fff" cx="21" cy="21" r="15.91549430918954" />
        <g className="donut-chart-text">
          <text x="50%" y="50%" className="donut-chart-number">
            {formatPercentage(completePercentage)}{isLocaleRtl && '\u200f'}%
          </text>
          <text x="50%" y="50%" className="donut-chart-label">
            {intl.formatMessage(messages.donutLabel)}
          </text>
        </g>
        <IncompleteDonutSegment incompletePercentage={incompletePercentage} />
        <LockedDonutSegment lockedPercentage={lockedPercentage} />
        <CompleteDonutSegment completePercentage={completePercentage} lockedPercentage={lockedPercentage} />
      </svg>
      <div className="sr-only">
        {intl.formatMessage(messages.percentComplete, { percent: formatPercentage(completePercentage) })}
        {intl.formatMessage(messages.percentIncomplete, { percent: formatPercentage(incompletePercentage) })}
        {lockedPercentage > 0 && (
          <>
            {intl.formatMessage(messages.percentLocked, { percent: formatPercentage(lockedPercentage) })}
          </>
        )}
      </div>
    </>
  );
};

export default CompletionDonutChart;

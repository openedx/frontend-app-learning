import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { OverlayTrigger, Popover } from '@edx/paragon';

import messages from './messages';

function CompleteDonutSegment({ completePercentage, intl, lockedPercentage }) {
  if (!completePercentage) {
    return null;
  }

  const [showCompletePopover, setShowCompletePopover] = useState(false);

  const completeSegmentOffset = (3.6 * completePercentage) / 8;
  let completeTooltipDegree = completePercentage < 100 ? -completeSegmentOffset : 0;

  const lockedSegmentOffset = lockedPercentage - 75;
  if (lockedPercentage > 0) {
    completeTooltipDegree = (lockedSegmentOffset + completePercentage) * -3.6 + 90 + completeSegmentOffset;
  }

  return (
    <g
      className="donut-segment-group"
      onBlur={() => setShowCompletePopover(false)}
      onFocus={() => setShowCompletePopover(true)}
      tabIndex="-1"
    >
      {/* Tooltip */}
      <OverlayTrigger
        show={showCompletePopover}
        placement="top"
        overlay={(
          <Popover aria-hidden="true">
            <Popover.Content>
              {intl.formatMessage(messages.completeContentTooltip)}
            </Popover.Content>
          </Popover>
        )}
      >
        {/* Used to anchor the tooltip within the complete segment's stroke */}
        <rect x="19" y="3" style={{ transform: `rotate(${completeTooltipDegree}deg)` }} />
      </OverlayTrigger>

      {/* Complete segment */}
      <circle
        className="donut-segment complete-stroke"
        cx="21"
        cy="21"
        r="15.91549430918954"
        strokeDasharray={`${completePercentage} ${100 - completePercentage}`}
        strokeDashoffset={lockedSegmentOffset + completePercentage}
      />

      {/* Segment dividers */}
      {lockedPercentage > 0 && lockedPercentage < 100 && (
        <circle
          cx="21"
          cy="21"
          r="15.91549430918954"
          className="donut-segment divider-stroke"
          strokeDasharray="0.3 99.7"
          strokeDashoffset={0.15 + lockedSegmentOffset}
        />
      )}
      {completePercentage < 100 && lockedPercentage > 0 && lockedPercentage < 100
      && lockedPercentage + completePercentage === 100 && (
        <circle
          cx="21"
          cy="21"
          r="15.91549430918954"
          className="donut-segment divider-stroke"
          strokeDasharray="0.3 99.7"
          strokeDashoffset="25.15"
        />
      )}
    </g>
  );
}

CompleteDonutSegment.propTypes = {
  completePercentage: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
  lockedPercentage: PropTypes.number.isRequired,
};

export default injectIntl(CompleteDonutSegment);

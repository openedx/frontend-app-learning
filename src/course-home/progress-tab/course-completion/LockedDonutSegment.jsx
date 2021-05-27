import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { OverlayTrigger, Popover } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

function LockedDonutSegment({ intl, lockedPercentage }) {
  const [showLockedPopover, setShowLockedPopover] = useState(false);

  if (!lockedPercentage) {
    return null;
  }

  const iconDegree = lockedPercentage > 8 ? (3.6 * lockedPercentage) / 8 : ((3.6 * lockedPercentage) / 5) * 2;

  return (
    <g
      className="donut-segment-group"
      onBlur={() => setShowLockedPopover(false)}
      onFocus={() => setShowLockedPopover(true)}
      tabIndex="-1"
    >
      <circle
        className="donut-segment locked-stroke"
        cx="21"
        cy="21"
        r="15.91549430918954"
        strokeDasharray={`${lockedPercentage} ${100 - lockedPercentage}`}
        strokeDashoffset={lockedPercentage - 75}
      />

      {/* Tooltip */}
      <OverlayTrigger
        show={showLockedPopover}
        placement="top"
        overlay={(
          <Popover aria-hidden="true">
            <Popover.Content>
              {intl.formatMessage(messages.lockedContentTooltip)}
            </Popover.Content>
          </Popover>
        )}
      >
        <g
          width="6"
          height="21"
          viewBox="0 0 21 6"
          style={{
            transformOrigin: 'center',
            transform: `rotate(-${iconDegree}deg)`,
          }}
        >
          {/* Locked icon */}
          <path
            d="M20 8.00002H17V6.21002C17 3.60002 15.09 1.27002 12.49 1.02002C9.51 0.740018 7 3.08002 7 6.00002V8.00002H4V22H20V8.00002ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM9 8.00002V6.00002C9 4.34002 10.34 3.00002 12 3.00002C13.66 3.00002 15 4.34002 15 6.00002V8.00002H9Z"
            fill={lockedPercentage > 5 ? 'white' : 'transparent'}
            style={{ transform: `scale(0.18) translate(5.8em, .7em) rotate(${iconDegree}deg)` }}
          />
        </g>
      </OverlayTrigger>
    </g>
  );
}

LockedDonutSegment.propTypes = {
  intl: intlShape.isRequired,
  lockedPercentage: PropTypes.number.isRequired,
};

export default injectIntl(LockedDonutSegment);

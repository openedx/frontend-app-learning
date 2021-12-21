import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape, isRtl } from '@edx/frontend-platform/i18n';
import { OverlayTrigger, Popover } from '@edx/paragon';

import messages from '../messages';

function PassingGradeTooltip({ intl, passingGrade, tooltipClassName }) {
  let passingGradeDirection = passingGrade < 50 ? '' : '-';

  if (isRtl) {
    passingGradeDirection = passingGrade < 50 ? '-' : '';
  }

  return (
    <>
      <OverlayTrigger
        show
        placement="bottom"
        overlay={(
          <Popover id="minimum-grade-tooltip" className={`bg-primary-500 ${tooltipClassName}`} aria-hidden="true">
            <Popover.Content className="text-white">
              {passingGrade}%
            </Popover.Content>
          </Popover>
        )}
      >
        <g>
          <circle cx={`${isRtl ? 100 - passingGrade : passingGrade}%`} cy="50%" r="8.5" fill="transparent" />
          <circle className="grade-bar--passing" cx={`${isRtl ? 100 - passingGrade : passingGrade}%`} cy="50%" r="4.5" />
        </g>
      </OverlayTrigger>

      <text
        className="x-small"
        textAnchor={passingGrade < 50 ? 'start' : 'end'}
        x={`${isRtl ? 100 - passingGrade : passingGrade}%`}
        y="90px"
        style={{ transform: `translateX(${passingGradeDirection}3.4em)` }}
      >
        {intl.formatMessage(messages.passingGradeLabel)}
      </text>
    </>
  );
}

PassingGradeTooltip.defaultProps = {
  tooltipClassName: '',
};

PassingGradeTooltip.propTypes = {
  intl: intlShape.isRequired,
  passingGrade: PropTypes.number.isRequired,
  tooltipClassName: PropTypes.string,
};

export default injectIntl(PassingGradeTooltip);

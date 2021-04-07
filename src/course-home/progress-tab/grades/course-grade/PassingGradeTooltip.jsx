import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { OverlayTrigger, Popover } from '@edx/paragon';

import messages from '../messages';

function PassingGradeTooltip({ intl, passingGrade }) {
  return (
    <>
      <OverlayTrigger
        show
        placement="bottom"
        overlay={(
          <Popover id="minimum-grade-tooltip" className="bg-primary-500" aria-hidden="true">
            <Popover.Content className="text-white">
              {passingGrade}%
            </Popover.Content>
          </Popover>
        )}
      >
        <g>
          <circle cx={`${passingGrade}%`} cy="50%" r="8.5" fill="transparent" />
          <circle className="grade-bar--passing" cx={`${passingGrade}%`} cy="50%" r="4.5" />
        </g>
      </OverlayTrigger>

      <text
        className="x-small"
        textAnchor={passingGrade < 50 ? 'start' : 'end'}
        x={`${passingGrade}%`}
        y="90px"
        style={{ transform: `translateX(${passingGrade < 50 ? '' : '-'}3em)` }}
      >
        {intl.formatMessage(messages.passingGradeLabel)}
      </text>
    </>
  );
}

PassingGradeTooltip.propTypes = {
  intl: intlShape.isRequired,
  passingGrade: PropTypes.number.isRequired,
};

export default injectIntl(PassingGradeTooltip);

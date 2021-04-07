import React from 'react';
import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { OverlayTrigger, Popover } from '@edx/paragon';

import { useModel } from '../../../../generic/model-store';

import messages from '../messages';

function CurrentGradeTooltip({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    courseGrade: {
      isPassing,
      percent,
    },
  } = useModel('progress', courseId);

  const currentGrade = percent * 100;

  return (
    <>
      <OverlayTrigger
        show
        placement="top"
        overlay={(
          <Popover id={`${isPassing ? 'passing' : 'non-passing'}-grade-tooltip`} aria-hidden="true">
            <Popover.Content className={isPassing ? 'text-white' : 'text-dark-700'}>
              {currentGrade.toFixed(0)}%
            </Popover.Content>
          </Popover>
        )}
      >
        <g>
          <circle cx={`${currentGrade}%`} cy="50%" r="8.5" fill="transparent" />
          <rect className="grade-bar__divider" x={`${currentGrade}%`} style={{ transform: 'translateY(2.61em)' }} />
        </g>
      </OverlayTrigger>
      <text
        className="x-small"
        textAnchor={currentGrade < 50 ? 'start' : 'end'}
        x={`${currentGrade}%`}
        y="20px"
        style={{ transform: `translateX(${currentGrade < 50 ? '' : '-'}3em)` }}
      >
        {intl.formatMessage(messages.currentGradeLabel)}
      </text>
    </>
  );
}

CurrentGradeTooltip.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CurrentGradeTooltip);

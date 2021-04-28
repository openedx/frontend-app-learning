import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { InfoOutline } from '@edx/paragon/icons';
import {
  Icon, IconButton, OverlayTrigger, Popover,
} from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

import messages from '../messages';

function GradeRangeTooltip({ intl, iconButtonClassName, passingGrade }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradingPolicy: {
      gradeRange,
    },
  } = useModel('progress', courseId);

  const [showTooltip, setShowTooltip] = useState(false);

  const gradeRangeEntries = Object.entries(gradeRange);

  return (
    <OverlayTrigger
      placement="top"
      trigger="click"
      show={showTooltip}
      overlay={(
        <Popover>
          <Popover.Content className="px-3">
            {intl.formatMessage(messages.courseGradeRangeTooltip)}
            <ul className="list-unstyled m-0">
              {gradeRangeEntries.map((entry, index) => {
                if (index === 0) {
                  return (
                    <li key={entry[0]}>
                      {entry[0]}: {(entry[1] * 100).toFixed(0)}%-100%
                    </li>
                  );
                }
                const previousGrade = gradeRangeEntries[index - 1];
                return (
                  <li key={entry[0]}>
                    {entry[0]}: {(entry[1] * 100).toFixed(0)}%-{(previousGrade[1] * 100).toFixed(0)}%
                  </li>
                );
              })}
              <li>F: {'<'}{passingGrade}%</li>
            </ul>
          </Popover.Content>
        </Popover>
      )}
    >
      <IconButton
        onClick={() => setShowTooltip(!showTooltip)}
        onBlur={() => setShowTooltip(false)}
        alt={intl.formatMessage(messages.gradeRangeTooltipAlt)}
        className={`mb-0 mt-n1 ${iconButtonClassName}`}
        src={InfoOutline}
        iconAs={Icon}
        size="inline"
      />
    </OverlayTrigger>
  );
}

GradeRangeTooltip.defaultProps = {
  iconButtonClassName: '',
};

GradeRangeTooltip.propTypes = {
  iconButtonClassName: PropTypes.string,
  intl: intlShape.isRequired,
  passingGrade: PropTypes.number.isRequired,
};

export default injectIntl(GradeRangeTooltip);

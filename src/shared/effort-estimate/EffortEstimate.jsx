import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

// This component shows an effort estimate provided by the backend block data. Either time, activities, or both.

function EffortEstimate(props) {
  const {
    block: {
      effortActivities,
      effortTime,
    },
    className,
    intl,
  } = props;

  const minuteCount = Math.ceil(effortTime / 60); // effortTime is in seconds
  const minutesAbbreviated = intl.formatMessage(messages.minutesAbbreviated, { minuteCount });
  const minutesFull = intl.formatMessage(messages.minutesFull, { minuteCount });
  const minutes = (
    <>
      <span aria-hidden="true">{minutesAbbreviated}</span>
      <span className="sr-only">{minutesFull}</span>
    </>
  );
  const activities = intl.formatMessage(messages.activities, { activityCount: effortActivities });
  let content = null;

  if (effortTime && effortActivities) {
    content = (
      <FormattedMessage
        id="learning.effortEstimation.combinedEstimate"
        defaultMessage="{minutes} + {activities}"
        description="You can likely leave this alone, unless you want to use a full width plus or similar change"
        values={{ activities, minutes }}
      />
    );
  } else if (effortTime) {
    content = minutes;
  } else if (effortActivities) {
    content = activities;
  } else {
    return null;
  }

  return (
    <span
      className={classNames('text-gray-500 text-monospace', className)}
      style={{ fontSize: '0.8em' }}
    >
      {content}
    </span>
  );
}

EffortEstimate.defaultProps = {
  className: null,
};

EffortEstimate.propTypes = {
  block: PropTypes.shape({
    effortActivities: PropTypes.number,
    effortTime: PropTypes.number,
  }).isRequired,
  className: PropTypes.string,
  intl: intlShape.isRequired,
};

export default injectIntl(EffortEstimate);

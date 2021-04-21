import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedMessage,
  FormattedRelative,
  FormattedTime,
} from '@edx/frontend-platform/i18n';

import { Alert, ALERT_TYPES } from '../../../../generic/user-messages';

const DAY_MS = 24 * 60 * 60 * 1000; // in ms

function CourseStartAlert({ payload }) {
  const {
    startDate,
    userTimezone,
  } = payload;

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const timeRemaining = (
    <FormattedRelative
      key="timeRemaining"
      value={startDate}
      {...timezoneFormatArgs}
    />
  );

  const delta = new Date(startDate) - new Date();
  if (delta < DAY_MS) {
    return (
      <Alert type={ALERT_TYPES.INFO}>
        <FormattedMessage
          id="learning.outline.alert.start.short"
          defaultMessage="Course starts {timeRemaining} at {courseStartTime}."
          description="Used when the time remaining is less than a day away."
          values={{
            courseStartTime: (
              <FormattedTime
                key="courseStartTime"
                day="numeric"
                month="short"
                year="numeric"
                hourCycle="h23"
                timeZoneName="short"
                value={startDate}
                {...timezoneFormatArgs}
              />
            ),
            timeRemaining,
          }}
        />
      </Alert>
    );
  }

  return (
    <Alert type={ALERT_TYPES.INFO}>
      <strong>
        <FormattedMessage
          id="learning.outline.alert.end.long"
          defaultMessage="Course starts {timeRemaining} on {courseStartDate}."
          description="Used when the time remaining is more than a day away."
          values={{
            courseStartDate: (
              <FormattedDate
                key="courseStartDate"
                day="numeric"
                month="short"
                year="numeric"
                value={startDate}
                {...timezoneFormatArgs}
              />
            ),
            timeRemaining,
          }}
        />
      </strong>
      <br />
      <FormattedMessage
        id="learning.outline.alert.end.calendar"
        defaultMessage="Don’t forget to add a calendar reminder!"
      />
    </Alert>
  );
}

CourseStartAlert.propTypes = {
  payload: PropTypes.shape({
    startDate: PropTypes.string,
    userTimezone: PropTypes.string,
  }).isRequired,
};

export default CourseStartAlert;

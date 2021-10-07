import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedMessage,
  FormattedRelative,
  FormattedTime,
} from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

const DAY_MS = 24 * 60 * 60 * 1000; // in ms

function CourseEndAlert({ payload }) {
  const {
    description,
    endDate,
    userTimezone,
  } = payload;

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const timeRemaining = (
    <FormattedRelative
      key="timeRemaining"
      value={endDate}
      {...timezoneFormatArgs}
    />
  );

  let msg;
  const delta = new Date(endDate) - new Date();
  if (delta < DAY_MS) {
    const courseEndTime = (
      <FormattedTime
        key="courseEndTime"
        day="numeric"
        month="short"
        year="numeric"
        timeZoneName="short"
        value={endDate}
        {...timezoneFormatArgs}
      />
    );
    msg = (
      <FormattedMessage
        id="learning.outline.alert.end.short"
        defaultMessage="This course is ending {timeRemaining} at {courseEndTime}."
        description="Used when the time remaining is less than a day away."
        values={{
          courseEndTime,
          timeRemaining,
        }}
      />
    );
  } else {
    const courseEndDate = (
      <FormattedDate
        key="courseEndDate"
        day="numeric"
        month="short"
        year="numeric"
        value={endDate}
        {...timezoneFormatArgs}
      />
    );
    msg = (
      <FormattedMessage
        id="learning.outline.alert.end.long"
        defaultMessage="This course is ending {timeRemaining} on {courseEndDate}."
        description="Used when the time remaining is more than a day away."
        values={{
          courseEndDate,
          timeRemaining,
        }}
      />
    );
  }

  return (
    <Alert variant="info" icon={Info}>
      <strong>{msg}</strong><br />
      {description}
    </Alert>
  );
}

CourseEndAlert.propTypes = {
  payload: PropTypes.shape({
    description: PropTypes.string,
    endDate: PropTypes.string,
    userTimezone: PropTypes.string,
  }).isRequired,
};

export default CourseEndAlert;

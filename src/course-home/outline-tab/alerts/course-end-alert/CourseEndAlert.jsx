import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedMessage,
  FormattedRelativeTime,
  FormattedTime,
} from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

const DAY_SEC = 24 * 60 * 60; // in seconds
const DAY_MS = DAY_SEC * 1000; // in ms
const YEAR_SEC = 365 * DAY_SEC; // in seconds

const CourseEndAlert = ({ payload }) => {
  const {
    description,
    endDate,
    userTimezone,
  } = payload;

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  let msg;
  const delta = new Date(endDate) - new Date();
  const timeRemaining = (
    <FormattedRelativeTime
      key="timeRemaining"
      value={delta / 1000}
      numeric="auto"
      // 1 year interval to help auto format. It won't format without updateIntervalInSeconds.
      updateIntervalInSeconds={YEAR_SEC}
      {...timezoneFormatArgs}
    />
  );

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
};

CourseEndAlert.propTypes = {
  payload: PropTypes.shape({
    description: PropTypes.string,
    endDate: PropTypes.string,
    userTimezone: PropTypes.string,
  }).isRequired,
};

export default CourseEndAlert;

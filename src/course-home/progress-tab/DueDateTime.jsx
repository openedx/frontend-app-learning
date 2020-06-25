import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FormattedDate, FormattedTime } from '@edx/frontend-platform/i18n';
import { useModel } from '../../generic/model-store';

export default function DueDateTime({
  due,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    userTimezone,
  } = useModel('progress', courseId);
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  return (
    <em className="ml-0">
      due <FormattedDate
        value={due}
        day="numeric"
        month="short"
        weekday="short"
        year="numeric"
        {...timezoneFormatArgs}
      /> <FormattedTime
        value={due}
      />
    </em>
  );
}

DueDateTime.propTypes = {
  due: PropTypes.string.isRequired,
};

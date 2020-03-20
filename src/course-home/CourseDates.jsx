import React from 'react';
import PropTypes from 'prop-types';

export default function CourseDates({
  start,
  end,
  enrollmentStart,
  enrollmentEnd,
  enrollmentMode,
  isEnrolled,
}) {
  return (
    <section>
      <h4>Upcoming Dates</h4>
      <div><strong>Course Start:</strong><br />{start}</div>
      <div><strong>Course End:</strong><br />{end}</div>
      <div><strong>Enrollment Start:</strong><br />{enrollmentStart}</div>
      <div><strong>Enrollment End:</strong><br />{enrollmentEnd}</div>
      <div><strong>Mode:</strong><br />{enrollmentMode}</div>
      <div>{isEnrolled ? 'Active Enrollment' : 'Inactive Enrollment'}</div>
    </section>
  );
}

CourseDates.propTypes = {
  start: PropTypes.string,
  end: PropTypes.string,
  enrollmentStart: PropTypes.string,
  enrollmentEnd: PropTypes.string,
  enrollmentMode: PropTypes.string,
  isEnrolled: PropTypes.bool,
};

CourseDates.defaultProps = {
  start: null,
  end: null,
  enrollmentStart: null,
  enrollmentEnd: null,
  enrollmentMode: null,
  isEnrolled: false,
};

import React from 'react';
import PropTypes from 'prop-types';
import { useModel } from '../../model-store';
import DateSummary from './DateSummary';

export default function CourseDates({ courseId }) {
  const {
    datesWidget,
  } = useModel('outline', courseId);
  return (
    <section className="mb-3">
      <h4>Upcoming Dates</h4>
      {datesWidget.courseDateBlocks.map((courseDateBlock) => (
        <DateSummary
          key={courseDateBlock.title + courseDateBlock.date}
          dateBlock={courseDateBlock}
          userTimezone={datesWidget.userTimezone}
        />
      ))}
      <a className="font-weight-bold" href={datesWidget.datesTabLink}>View all course dates</a>
    </section>
  );
}

CourseDates.propTypes = {
  courseId: PropTypes.string,
};

CourseDates.defaultProps = {
  courseId: null,
};

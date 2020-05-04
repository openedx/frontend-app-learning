import React from 'react';
import PropTypes from 'prop-types';

export default function Day({ dateInfo }) {
  const parsedDate = new Date(dateInfo.date);
  const formattedDate = parsedDate.toLocaleString('default', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    year: 'numeric',
  });

  const hasLink = dateInfo.link && !dateInfo.containsGatedContent;
  const title = hasLink ? (<u><a href={dateInfo.link} className="text-reset">{dateInfo.title}</a></u>) : dateInfo.title;
  const textColor = dateInfo.containsGatedContent ? 'text-dark-200' : 'text-dark-500';

  return (
    <div className="mb-4">
      <h5>{formattedDate}</h5>
      <div className={textColor}>
        <div className="font-weight-bold">{title}</div>
      </div>
    </div>
  );
}

Day.propTypes = {
  dateInfo: PropTypes.shape({
    containsGatedContent: PropTypes.bool,
    date: PropTypes.string,
    link: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
};

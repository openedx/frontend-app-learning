import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function SequenceLink({ id, courseId, title }) {
  return (
    <div className="ml-4">
      <Link to={`/course/${courseId}/${id}`}>{title}</Link>
    </div>
  );
}

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

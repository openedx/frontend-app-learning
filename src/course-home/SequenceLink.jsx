import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useModel } from '../model-store';

export default function SequenceLink({ id, courseId }) {
  const sequence = useModel('sequences', id);
  return (
    <div className="ml-4">
      <Link to={`/learning/course/${courseId}/${id}`}>{sequence.title}</Link>
    </div>
  );
}

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
};

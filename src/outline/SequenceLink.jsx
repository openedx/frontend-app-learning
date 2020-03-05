import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { courseBlocksShape } from '../data/course-blocks';

export default function SequenceLink({ id, courseUsageKey, models }) {
  const sequence = models[id];
  return (
    <div className="ml-4">
      <Link to={`/course/${courseUsageKey}/${id}`}>{sequence.displayName}</Link>
    </div>
  );
}

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
  models: courseBlocksShape.isRequired,
};

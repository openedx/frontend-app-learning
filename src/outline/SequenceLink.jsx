import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useModel } from '../data/model-store';

export default function SequenceLink({ id, courseUsageKey }) {
  const sequence = useModel('sequences', id);
  return (
    <div className="ml-4">
      <Link to={`/course/${courseUsageKey}/${id}`}>{sequence.title}</Link>
    </div>
  );
}

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';

import CourseContainer from './CourseContainer';

export default function LearningSequencePage({ match }) {
  const {
    courseUsageKey,
    sequenceId,
    unitId,
  } = match.params;

  return (
    <CourseContainer
      courseUsageKey={courseUsageKey}
      sequenceId={sequenceId}
      unitId={unitId}
    />
  );
}

LearningSequencePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseUsageKey: PropTypes.string.isRequired,
      sequenceId: PropTypes.string,
      unitId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

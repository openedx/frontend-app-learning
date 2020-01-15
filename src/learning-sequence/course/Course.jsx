import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { history } from '@edx/frontend-platform';

import CourseBreadcrumbs from './CourseBreadcrumbs';
import SequenceContainer from './SequenceContainer';
import { createSequenceIdList } from '../utils';
import AlertList from '../../user-messages/AlertList';

export default function Course({
  courseUsageKey, courseId, sequenceId, unitId, models,
}) {
  const nextSequenceHandler = useCallback(() => {
    const sequenceIds = createSequenceIdList(models, courseId);
    const currentIndex = sequenceIds.indexOf(sequenceId);
    if (currentIndex < sequenceIds.length - 1) {
      const nextSequenceId = sequenceIds[currentIndex + 1];
      const nextSequence = models[nextSequenceId];
      const nextUnitId = nextSequence.children[0];
      history.push(`/course/${courseUsageKey}/${nextSequenceId}/${nextUnitId}`);
    }
  });

  const previousSequenceHandler = useCallback(() => {
    const sequenceIds = createSequenceIdList(models, courseId);
    const currentIndex = sequenceIds.indexOf(sequenceId);
    if (currentIndex > 0) {
      const previousSequenceId = sequenceIds[currentIndex - 1];
      const previousSequence = models[previousSequenceId];
      const previousUnitId = previousSequence.children[previousSequence.children.length - 1];
      history.push(`/course/${courseUsageKey}/${previousSequenceId}/${previousUnitId}`);
    }
  });

  return (
    <main className="container-fluid d-flex flex-column flex-grow-1">
      <AlertList topic="course" className="mt-3" />
      <CourseBreadcrumbs
        courseUsageKey={courseUsageKey}
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={unitId}
        models={models}
      />
      <SequenceContainer
        key={sequenceId}
        courseUsageKey={courseUsageKey}
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={unitId}
        models={models}
        onNext={nextSequenceHandler}
        onPrevious={previousSequenceHandler}
      />
    </main>
  );
}

Course.propTypes = {
  courseUsageKey: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  models: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.string),
    parentId: PropTypes.string,
  })).isRequired,
};

Course.defaultProps = {
  unitId: null,
};

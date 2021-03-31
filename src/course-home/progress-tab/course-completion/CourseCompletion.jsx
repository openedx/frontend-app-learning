import React from 'react';
import { useSelector } from 'react-redux';
import { useModel } from '../../../generic/model-store';

function CourseCompletion() {
  // TODO: AA-720
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    completionSummary: {
      completeCount,
      incompleteCount,
      lockedCount,
    },
  } = useModel('progress', courseId);

  const total = completeCount + incompleteCount + lockedCount;
  const completePercentage = ((completeCount / total) * 100).toFixed(0);
  const incompletePercentage = ((incompleteCount / total) * 100).toFixed(0);
  const lockedPercentage = ((lockedCount / total) * 100).toFixed(0);

  return (
    <section className="text-dark-700 mb-4 rounded shadow-sm p-4">
      <h2>Course completion</h2>
      <p className="small">This represents how much course content you have completed.</p>
      Complete: {completePercentage}%
      Incomplete: {incompletePercentage}%
      Locked: {lockedPercentage}%
    </section>
  );
}

export default CourseCompletion;

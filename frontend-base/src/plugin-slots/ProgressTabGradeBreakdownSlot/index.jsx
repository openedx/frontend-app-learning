import React from 'react';
import DetailedGrades from '../../course-home/progress-tab/grades/detailed-grades/DetailedGrades';
import GradeSummary from '../../course-home/progress-tab/grades/grade-summary/GradeSummary';
import { useProgressData } from '../../course-home/progress-tab/hooks';

// https://github.com/openedx/frontend-app-learning/issues/2185
const ProgressTabGradeBreakdownSlot = () => {
  const { gradesFeatureIsFullyLocked } = useProgressData();
  const applyLockedOverlay = gradesFeatureIsFullyLocked ? 'locked-overlay' : '';
  return (
    <>
      <div
        className={`grades my-4 p-4 rounded raised-card ${applyLockedOverlay}`}
        aria-hidden={gradesFeatureIsFullyLocked}
      >
        <GradeSummary />
        <DetailedGrades />
      </div>
    </>
  );
};

ProgressTabGradeBreakdownSlot.propTypes = {};

export default ProgressTabGradeBreakdownSlot;

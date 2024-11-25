import { useModel } from '@src/generic/model-store';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import React from 'react';
import { useSelector } from 'react-redux';
import DetailedGrades from '../../course-home/progress-tab/grades/detailed-grades/DetailedGrades';
import GradeSummary from '../../course-home/progress-tab/grades/grade-summary/GradeSummary';

const ProgressTabGradeBreakdownSlot = () => {
  const { courseId } = useSelector(state => state.courseHome);
  const { gradesFeatureIsFullyLocked } = useModel('progress', courseId);
  const applyLockedOverlay = gradesFeatureIsFullyLocked ? 'locked-overlay' : '';
  return (
    <PluginSlot
      id="progress_tab_grade_breakdown_slot"
    >
      <div
        className={`grades my-4 p-4 rounded raised-card ${applyLockedOverlay}`}
        aria-hidden={gradesFeatureIsFullyLocked}
      >
        <GradeSummary />
        <DetailedGrades />
      </div>
    </PluginSlot>
  );
};

ProgressTabGradeBreakdownSlot.propTypes = {};

export default ProgressTabGradeBreakdownSlot;

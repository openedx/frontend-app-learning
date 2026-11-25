import { Slot } from '@openedx/frontend-base';

import DetailedGrades from '@src/course-home/progress-tab/grades/detailed-grades/DetailedGrades';
import GradeSummary from '@src/course-home/progress-tab/grades/grade-summary/GradeSummary';
import { useProgressData } from '@src/course-home/progress-tab/hooks';

export const progressTabGradeBreakdownSlotId = 'org.openedx.frontend.slot.learning.progressTabGradeBreakdown.v1';

export interface ProgressTabGradeBreakdownSlotProps {
  courseId: string;
}

const ProgressTabGradeBreakdownSlot = ({ courseId }: ProgressTabGradeBreakdownSlotProps) => {
  // The progress tab renders its slots only once the progress data has loaded.
  const gradesFeatureIsFullyLocked = useProgressData()?.gradesFeatureIsFullyLocked;
  const applyLockedOverlay = gradesFeatureIsFullyLocked ? 'locked-overlay' : '';
  return (
    <Slot id={progressTabGradeBreakdownSlotId} courseId={courseId}>
      <div
        className={`grades my-4 p-4 rounded raised-card ${applyLockedOverlay}`}
        aria-hidden={gradesFeatureIsFullyLocked}
      >
        <GradeSummary />
        <DetailedGrades />
      </div>
    </Slot>
  );
};

export default ProgressTabGradeBreakdownSlot;

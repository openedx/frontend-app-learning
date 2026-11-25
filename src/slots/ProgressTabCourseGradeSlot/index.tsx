import { Slot } from '@openedx/frontend-base';

import CourseGrade from '@src/course-home/progress-tab/grades/course-grade/CourseGrade';

export const progressTabCourseGradeSlotId = 'org.openedx.frontend.slot.learning.progressTabCourseGrade.v1';

export interface ProgressTabCourseGradeSlotProps {
  courseId: string;
}

const ProgressTabCourseGradeSlot = ({ courseId }: ProgressTabCourseGradeSlotProps) => (
  <Slot id={progressTabCourseGradeSlotId} courseId={courseId}>
    <CourseGrade />
  </Slot>
);

export default ProgressTabCourseGradeSlot;

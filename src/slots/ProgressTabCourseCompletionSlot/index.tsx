import { Slot } from '@openedx/frontend-base';

import CourseCompletion from '@src/course-home/progress-tab/course-completion/CourseCompletion';

export const progressTabCourseCompletionSlotId = 'org.openedx.frontend.slot.learning.progressTabCourseCompletion.v1';

export interface ProgressTabCourseCompletionSlotProps {
  courseId: string;
  enableProgressGraph: boolean;
}

const ProgressTabCourseCompletionSlot = ({ courseId, enableProgressGraph }: ProgressTabCourseCompletionSlotProps) => (
  <Slot id={progressTabCourseCompletionSlotId} courseId={courseId} enableProgressGraph={enableProgressGraph}>
    {enableProgressGraph && <CourseCompletion />}
  </Slot>
);

export default ProgressTabCourseCompletionSlot;

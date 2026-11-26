import { Slot } from '@openedx/frontend-base';

import CourseOutlineTrigger from '@src/courseware/course/sidebar/sidebars/course-outline/CourseOutlineTrigger';

export const courseOutlineMobileSidebarTriggerSlotId = 'org.openedx.frontend.slot.learning.courseOutlineMobileSidebarTrigger.v1';

export interface CourseOutlineMobileSidebarTriggerSlotProps {
  courseId: string;
  sequenceId: string | null;
  unitId: string | null;
}

const CourseOutlineMobileSidebarTriggerSlot = ({
  courseId, sequenceId, unitId,
}: CourseOutlineMobileSidebarTriggerSlotProps) => (
  <Slot id={courseOutlineMobileSidebarTriggerSlotId} courseId={courseId} sequenceId={sequenceId} unitId={unitId}>
    <CourseOutlineTrigger isMobileView />
  </Slot>
);

export default CourseOutlineMobileSidebarTriggerSlot;

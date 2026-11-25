import { Slot } from '@openedx/frontend-base';

import CourseOutlineTrigger from '@src/courseware/course/sidebar/sidebars/course-outline/CourseOutlineTrigger';

export const courseOutlineSidebarTriggerSlotId = 'org.openedx.frontend.slot.learning.courseOutlineSidebarTrigger.v1';

export interface CourseOutlineSidebarTriggerSlotProps {
  courseId: string;
  sectionId: string | null;
  sequenceId: string | null;
  unitId: string | null;
  isStaff?: boolean;
}

const CourseOutlineSidebarTriggerSlot = ({
  courseId, sectionId, sequenceId, unitId, isStaff,
}: CourseOutlineSidebarTriggerSlotProps) => (
  <Slot
    id={courseOutlineSidebarTriggerSlotId}
    courseId={courseId}
    sectionId={sectionId}
    sequenceId={sequenceId}
    unitId={unitId}
    isStaff={isStaff}
  >
    <CourseOutlineTrigger isMobileView={false} />
  </Slot>
);

export default CourseOutlineSidebarTriggerSlot;

import { Slot } from '@openedx/frontend-base';

import CourseOutlineTray from '@src/courseware/course/sidebar/sidebars/course-outline/CourseOutlineTray';

export const courseOutlineSidebarSlotId = 'org.openedx.frontend.slot.learning.courseOutlineSidebar.v1';

export interface CourseOutlineSidebarSlotProps {
  courseId: string;
  sequenceId: string | null;
  unitId: string | null;
}

const CourseOutlineSidebarSlot = ({ courseId, sequenceId, unitId }: CourseOutlineSidebarSlotProps) => (
  <Slot id={courseOutlineSidebarSlotId} courseId={courseId} sequenceId={sequenceId} unitId={unitId}>
    <CourseOutlineTray />
  </Slot>
);

export default CourseOutlineSidebarSlot;

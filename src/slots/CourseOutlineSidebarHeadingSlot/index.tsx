import { Slot } from '@openedx/frontend-base';

import {
  CourseOutlineHeading,
  type CourseOutlineHeadingProps,
} from '@src/courseware/course/sidebar/sidebars/course-outline/components/CourseOutlineHeading';

export const courseOutlineSidebarHeadingSlotId = 'org.openedx.frontend.slot.learning.courseOutlineSidebarHeading.v1';

export type CourseOutlineSidebarHeadingSlotProps = CourseOutlineHeadingProps;

const CourseOutlineSidebarHeadingSlot = ({
  onToggleCollapse, isDisplaySequenceLevel, backButton,
}: CourseOutlineSidebarHeadingSlotProps) => (
  <Slot
    id={courseOutlineSidebarHeadingSlotId}
    onToggleCollapse={onToggleCollapse}
    isDisplaySequenceLevel={isDisplaySequenceLevel}
    backButton={backButton}
  >
    <CourseOutlineHeading
      onToggleCollapse={onToggleCollapse}
      isDisplaySequenceLevel={isDisplaySequenceLevel}
      backButton={backButton}
    />
  </Slot>
);

export default CourseOutlineSidebarHeadingSlot;

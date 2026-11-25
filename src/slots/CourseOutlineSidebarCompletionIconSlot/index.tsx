import { Slot } from '@openedx/frontend-base';

import {
  CompletionIcon,
  type CompletionIconProps,
} from '@src/courseware/course/sidebar/sidebars/course-outline/components/CompletionIcon';

export const courseOutlineSidebarCompletionIconSlotId = 'org.openedx.frontend.slot.learning.courseOutlineSidebarCompletionIcon.v1';

export interface CourseOutlineSidebarCompletionIconSlotProps extends CompletionIconProps {
  active: boolean;
  variant: 'section' | 'sequence';
}

const CourseOutlineSidebarCompletionIconSlot = ({
  completionStat, enabled, active, variant,
}: CourseOutlineSidebarCompletionIconSlotProps) => (
  <Slot
    id={courseOutlineSidebarCompletionIconSlotId}
    completionStat={completionStat}
    enabled={enabled}
    active={active}
    variant={variant}
  >
    <CompletionIcon completionStat={completionStat} enabled={enabled} />
  </Slot>
);

export default CourseOutlineSidebarCompletionIconSlot;

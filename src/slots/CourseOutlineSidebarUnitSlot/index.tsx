import { Slot } from '@openedx/frontend-base';
import type { ReactNode } from 'react';

import SidebarUnitContent from '@src/courseware/course/sidebar/sidebars/course-outline/components/SidebarUnitContent';

export const courseOutlineSidebarUnitSlotId = 'org.openedx.frontend.slot.learning.courseOutlineSidebarUnit.v1';

export interface CourseOutlineSidebarUnitSlotProps {
  unit: {
    complete?: boolean;
    icon?: string;
    id?: string;
    title?: string;
    type?: string;
  };
  icon: ReactNode;
  isLocked: boolean;
  isCompletionTrackingEnabled: boolean;
}

const CourseOutlineSidebarUnitSlot = ({
  unit, icon, isLocked, isCompletionTrackingEnabled,
}: CourseOutlineSidebarUnitSlotProps) => (
  <Slot
    id={courseOutlineSidebarUnitSlotId}
    unit={unit}
    icon={icon}
    isLocked={isLocked}
    isCompletionTrackingEnabled={isCompletionTrackingEnabled}
  >
    <SidebarUnitContent
      title={unit.title}
      isComplete={unit.complete}
      isCompletionTrackingEnabled={isCompletionTrackingEnabled}
      icon={icon}
    />
  </Slot>
);

export default CourseOutlineSidebarUnitSlot;

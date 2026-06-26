import { PluginSlot } from '@openedx/frontend-plugin-framework';
import SidebarUnitContent from '@src/courseware/course/sidebar/sidebars/course-outline/components/SidebarUnitContent';
import {
  type UnitIconType,
} from '@src/courseware/course/sidebar/sidebars/course-outline/components/UnitIcon';
import React from 'react';

export interface Props {
  unit: {
    complete: boolean;
    icon: UnitIconType;
    id: string;
    title: string;
    type: string;
  };
  icon: React.ReactNode;
  isLocked: boolean;
  isCompletionTrackingEnabled: boolean;
}

export const CourseOutlineSidebarUnitSlot = ({
  unit,
  icon,
  isLocked,
  isCompletionTrackingEnabled,
}: Props) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_sidebar_unit.v1"
    pluginProps={{
      unit,
      isLocked,
      isCompletionTrackingEnabled,
      icon,
    }}
  >
    <SidebarUnitContent
      unit={unit}
      isCompletionTrackingEnabled={isCompletionTrackingEnabled}
      icon={icon}
    />
  </PluginSlot>
);

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import SidebarUnitContent from '@src/courseware/course/sidebar/sidebars/course-outline/components/SidebarUnitContent';
import React from 'react';

export interface Props {
  unit: {
    complete?: boolean;
    icon?: string;
    id?: string;
    title?: string;
    type?: string;
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
      title={unit.title}
      isComplete={unit.complete}
      isCompletionTrackingEnabled={isCompletionTrackingEnabled}
      icon={icon}
    />
  </PluginSlot>
);

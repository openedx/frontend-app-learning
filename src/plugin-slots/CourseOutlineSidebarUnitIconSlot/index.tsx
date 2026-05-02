import { PluginSlot } from '@openedx/frontend-plugin-framework';
import UnitIcon, {
  UNIT_ICON_TYPES,
  type UnitIconType,
  type UnitIconProps,
} from '@src/courseware/course/sidebar/sidebars/course-outline/components/UnitIcon';
import React from 'react';

export interface Props extends UnitIconProps {
  active: boolean;
}
export {
  UNIT_ICON_TYPES,
  type UnitIconType,
};

export const CourseOutlineSidebarUnitIconSlot = ({
  type, isCompleted, active, ...props
}: Props) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_sidebar_unit_icon.v1"
    pluginProps={{
      type, isCompleted, active, ...props,
    }}
  >
    <UnitIcon {...props} type={type} isCompleted={isCompleted} />
  </PluginSlot>
);

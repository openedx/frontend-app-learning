import {
  CourseOutlineHeading,
  type CourseOutlineHeadingProps,
} from '@src/courseware/course/sidebar/sidebars/course-outline/components/CourseOutlineHeading';
import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const CourseOutlineSidebarHeadingSlot = ({
  onToggleCollapse, isSequenceLevel, title, onClickBack,
}:CourseOutlineHeadingProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_sidebar_heading.v1"
    pluginProps={{
      onToggleCollapse, isSequenceLevel, title, onClickBack,
    }}
  >
    <CourseOutlineHeading
      onToggleCollapse={onToggleCollapse}
      isSequenceLevel={isSequenceLevel}
      title={title}
      onClickBack={onClickBack}
    />
  </PluginSlot>
);

import {
  CourseOutlineHeading,
  type CourseOutlineHeadingProps,
} from '@src/courseware/course/sidebar/sidebars/course-outline/components/CourseOutlineHeading';
import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const CourseOutlineSidebarHeadingSlot = ({
  onToggleCollapse, isDisplaySequenceLevel, backButton,
}:CourseOutlineHeadingProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_sidebar_heading.v1"
    pluginProps={{
      onToggleCollapse, isDisplaySequenceLevel, backButton,
    }}
  >
    <CourseOutlineHeading
      onToggleCollapse={onToggleCollapse}
      isDisplaySequenceLevel={isDisplaySequenceLevel}
      backButton={backButton}
    />
  </PluginSlot>
);

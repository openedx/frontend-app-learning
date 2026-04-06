import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CourseOutlineTray from '../../courseware/course/sidebar/sidebars/course-outline/CourseOutlineTray';

export const CourseOutlineSidebarSlot : React.FC = () => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_sidebar.v1"
    idAliases={['course_outline_sidebar_slot']}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <CourseOutlineTray />
  </PluginSlot>
);

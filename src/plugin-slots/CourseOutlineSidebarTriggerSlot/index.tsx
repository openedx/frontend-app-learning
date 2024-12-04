import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CourseOutlineTrigger from '../../courseware/course/sidebar/sidebars/course-outline/CourseOutlineTrigger';

export const CourseOutlineSidebarTriggerSlot : React.FC = () => (
  <PluginSlot
    id="course_outline_sidebar_trigger_slot"
    slotOptions={{
      mergeProps: true,
    }}
  >
    <CourseOutlineTrigger isMobileView={false} />
  </PluginSlot>
);

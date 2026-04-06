import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CourseOutlineTrigger from '../../courseware/course/sidebar/sidebars/course-outline/CourseOutlineTrigger';

export const CourseOutlineMobileSidebarTriggerSlot : React.FC = () => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_mobile_sidebar_trigger.v1"
    idAliases={['course_outline_mobile_sidebar_trigger_slot']}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <CourseOutlineTrigger isMobileView />
  </PluginSlot>
);

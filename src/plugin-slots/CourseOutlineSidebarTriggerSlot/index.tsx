import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CourseOutlineTrigger from '../../courseware/course/sidebar/sidebars/course-outline/CourseOutlineTrigger';

interface Props {
  sectionId?: string;
  sequenceId?: string;
  unitId?: string;
  isStaff?: boolean;
}

export const CourseOutlineSidebarTriggerSlot : React.FC<Props> = ({
  sectionId, sequenceId, unitId, isStaff,
}) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_sidebar_trigger.v1"
    idAliases={['course_outline_sidebar_trigger_slot']}
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      sectionId,
      sequenceId,
      unitId,
      isStaff,
    }}
  >
    <CourseOutlineTrigger isMobileView={false} />
  </PluginSlot>
);

import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const CourseOutlineTabNotificationsSlot = ({
  courseId,
} : CourseOutlineTabNotificationsSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_tab_notifications.v1"
    idAliases={['outline_tab_notifications_slot']}
    pluginProps={{
      courseId,
      model: 'outline',
    }}
  />
);

interface CourseOutlineTabNotificationsSlotProps {
  courseId: string;
}

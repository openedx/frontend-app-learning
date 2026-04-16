import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { UpgradeNotificationState } from '../../courseware/course/new-sidebar/SidebarContext';

export const NotificationWidgetSlot = ({
  courseId,
  notificationCurrentState,
  setNotificationCurrentState,
  toggleSidebar,
} : NotificationWidgetSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.notification_widget.v1"
    idAliases={['notification_widget_slot']}
    pluginProps={{
      courseId,
      model: 'coursewareMeta',
      notificationCurrentState,
      setNotificationCurrentState,
      toggleSidebar,
    }}
  />
);

interface NotificationWidgetSlotProps {
  courseId: string;
  notificationCurrentState: UpgradeNotificationState;
  setNotificationCurrentState: React.Dispatch<UpgradeNotificationState>;
  toggleSidebar: () => void;
}

import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { UpgradeNotificationState } from '../../courseware/course/new-sidebar/SidebarContext';

export const NotificationTraySlot = ({
  courseId,
  notificationCurrentState,
  setNotificationCurrentState,
} : NotificationTraySlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.notification_tray.v1"
    idAliases={['notification_tray_slot']}
    pluginProps={{
      courseId,
      model: 'coursewareMeta',
      notificationCurrentState,
      setNotificationCurrentState,
    }}
  />
);

interface NotificationTraySlotProps {
  courseId: string;
  notificationCurrentState: UpgradeNotificationState;
  setNotificationCurrentState: React.Dispatch<UpgradeNotificationState>;
}

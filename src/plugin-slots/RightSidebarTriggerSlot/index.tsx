import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import SidebarTriggers from '../../courseware/course/sidebar/SidebarTriggers';

export const RightSidebarTriggerSlot : React.FC = () => (
  <PluginSlot
    id="org.openedx.frontend.learning.right_sidebar_trigger.v1"
    idAliases={['right_sidebar_trigger_slot', 'notifications_discussions_sidebar_trigger_slot', 'org.openedx.frontend.learning.notifications_discussions_sidebar_trigger.v1']}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <SidebarTriggers />
  </PluginSlot>
);

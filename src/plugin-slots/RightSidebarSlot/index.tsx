import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import Sidebar from '../../courseware/course/sidebar/Sidebar';

export const RightSidebarSlot : React.FC = () => (
  <PluginSlot
    id="org.openedx.frontend.learning.right_sidebar.v1"
    idAliases={['right_sidebar_slot', 'notifications_discussions_sidebar_slot', 'org.openedx.frontend.learning.notifications_discussions_sidebar.v1']}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <Sidebar />
  </PluginSlot>
);

import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useModel } from '@src/generic/model-store';

import SidebarTriggers from '../../courseware/course/sidebar/SidebarTriggers';
import NewSidebarTriggers from '../../courseware/course/new-sidebar/SidebarTriggers';

interface Props {
  courseId: string;
}

export const NotificationsDiscussionsSidebarTriggerSlot : React.FC<Props> = ({ courseId }) => {
  const {
    isNewDiscussionSidebarViewEnabled,
  } = useModel('courseHomeMeta', courseId);

  return (
    <PluginSlot
      id="org.openedx.frontend.learning.notifications_discussions_sidebar_trigger.v1"
      idAliases={['notifications_discussions_sidebar_trigger_slot']}
      slotOptions={{
        mergeProps: true,
      }}
    >
      {isNewDiscussionSidebarViewEnabled ? <NewSidebarTriggers /> : <SidebarTriggers /> }
    </PluginSlot>
  );
};

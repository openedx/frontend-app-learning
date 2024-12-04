import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useModel } from '@src/generic/model-store';

import Sidebar from '../../courseware/course/sidebar/Sidebar';
import NewSidebar from '../../courseware/course/new-sidebar/Sidebar';

interface Props {
  courseId: string;
}

export const NotificationsDiscussionsSidebarSlot : React.FC<Props> = ({ courseId }) => {
  const {
    isNewDiscussionSidebarViewEnabled,
  } = useModel('courseHomeMeta', courseId);

  return (
    <PluginSlot
      id="notifications_discussions_sidebar_slot"
      slotOptions={{
        mergeProps: true,
      }}
    >
      {isNewDiscussionSidebarViewEnabled ? <NewSidebar /> : <Sidebar />}
    </PluginSlot>
  );
};

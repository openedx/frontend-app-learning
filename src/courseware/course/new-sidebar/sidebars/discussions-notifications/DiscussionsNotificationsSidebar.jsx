import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import SidebarBase from '../../common/SidebarBase';
import NotificationTray from './notifications/NotificationsWidget';
import DiscussionsSidebar from './discussions/DiscussionsWidget';
import messages from '../../messages';
import { ID } from './DiscussionsNotificationsTrigger';

const DiscussionsNotificationsSidebar = () => {
  const intl = useIntl();

  return (
    <SidebarBase
      ariaLabel={intl.formatMessage(messages.discussionNotificationTray)}
      sidebarId={ID}
      className="flex-fill"
      showTitleBar={false}
    >
      <NotificationTray />
      <div className="my-1.5" />
      <DiscussionsSidebar />
    </SidebarBase>
  );
};

export default DiscussionsNotificationsSidebar;

import React, { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import SidebarBase from '../../common/SidebarBase';
import NotificationTray from './notifications/NotificationsWidget';
import DiscussionsSidebar from './discussions/DiscussionsWidget';
import messages from '../../messages';
import { ID } from './DiscussionsNotificationsTrigger';
import SidebarContext from '../../SidebarContext';

const DiscussionsNotificationsSidebar = () => {
  const intl = useIntl();
  const { hideNotificationbar } = useContext(SidebarContext);

  return (
    <SidebarBase
      ariaLabel={intl.formatMessage(messages.discussionNotificationTray)}
      sidebarId={ID}
      className="d-flex flex-column flex-fill"
      showTitleBar={false}
      showBorder={false}
    >
      <NotificationTray />
      {!hideNotificationbar && <div className="my-1.5" />}
      <DiscussionsSidebar />
    </SidebarBase>
  );
};

export default DiscussionsNotificationsSidebar;

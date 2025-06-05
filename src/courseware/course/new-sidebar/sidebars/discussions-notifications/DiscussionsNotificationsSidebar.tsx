import React, { useContext } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import SidebarBase from '../../common/SidebarBase';
import messages from '../../messages';
import SidebarContext from '../../SidebarContext';
import DiscussionsSidebar from './discussions/DiscussionsWidget';
import NotificationTray from './notifications/NotificationsWidget';
import { ID } from './DiscussionsNotificationsTrigger';

const DiscussionsNotificationsSidebar = () => {
  const intl = useIntl();
  const { hideNotificationbar } = useContext(SidebarContext);

  return (
    <SidebarBase
      ariaLabel={intl.formatMessage(messages.discussionNotificationTray)}
      sidebarId={ID}
      className="d-flex flex-column flex-fill overflow-auto"
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

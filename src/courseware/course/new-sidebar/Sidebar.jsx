import React, { useContext } from 'react';
import { ArrowBackIos } from '@edx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import classNames from 'classnames';
import NotificationTray from './sidebars/notifications/NotificationTray';
import DiscussionsSidebar from './sidebars/discussions/DiscussionsSidebar';
import SidebarContext from './SidebarContext';
import messages from './messages';

const Sidebar = () => {
  const intl = useIntl();

  const {
    toggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
  } = useContext(SidebarContext);

  if (currentSidebar === null) { return null; }

  return (
    <div className={classNames('vh-100 d-flex flex-column', { 'bg-white fixed-top': shouldDisplayFullScreen })}>
      {shouldDisplayFullScreen
        && (
        <div
          className="pt-2 pb-2.5 border-bottom border-light-400 d-flex align-items-center ml-2"
          onClick={() => toggleSidebar(null)}
          onKeyDown={() => toggleSidebar(null)}
          role="button"
          tabIndex="0"
          alt={intl.formatMessage(messages.responsiveCloseSidebarTray)}
        >
          <Icon src={ArrowBackIos} />
          <span className="font-weight-bold m-2 d-inline-block">
            {intl.formatMessage(messages.responsiveCloseSidebarTray)}
          </span>
        </div>
        )}
      <NotificationTray />
      <DiscussionsSidebar />
    </div>
  );
};

export default Sidebar;

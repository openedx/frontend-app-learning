import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { WatchOutline } from '@edx/paragon/icons';

import './SidebarNotificationButton.scss';
import messages from './messages';

function SidebarNotificationButton({ intl, toggleSidebar, isSidebarVisible }) {
  return (
    <div className={classNames('sidebar-notification-btn-container', { active: isSidebarVisible() })} onClick={() => { toggleSidebar(); }} onKeyDown={() => { toggleSidebar(); }} role="button" tabIndex="0">
      <div className="sidebar-notification-btn">
        <Icon src={WatchOutline} className="sidebar-notification-icon" alt={intl.formatMessage(messages.notificationButton)} />
        <span className="notification-dot p-1" />
      </div>
    </div>
  );
}

SidebarNotificationButton.propTypes = {
  intl: intlShape.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarVisible: PropTypes.func.isRequired,
};

export default injectIntl(SidebarNotificationButton);

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import NotificationIcon from './NotificationIcon';
import './SidebarNotificationButton.scss';
import messages from './messages';

function SidebarNotificationButton({ intl, toggleSidebar, isSidebarVisible }) {
  return (
    <button
      className={classNames('sidebar-notification-btn', { active: isSidebarVisible() })}
      type="button"
      data-testid="SidebarButton"
      onClick={() => { toggleSidebar(); }}
      alt={intl.formatMessage(messages.notificationButton)}
    >
      <NotificationIcon status="active" notificationColor="bg-danger-500" />
    </button>
  );
}

SidebarNotificationButton.propTypes = {
  intl: intlShape.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarVisible: PropTypes.func.isRequired,
};

export default injectIntl(SidebarNotificationButton);

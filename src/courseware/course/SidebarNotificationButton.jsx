import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import NotificationIcon from './NotificationIcon';
import messages from './messages';

function SidebarNotificationButton({ intl, toggleSidebar, isSidebarVisible }) {
  return (
    <button
      className={classNames('sidebar-notification-btn', { active: isSidebarVisible() })}
      type="button"
      onClick={() => { toggleSidebar(); }}
      aria-label={intl.formatMessage(messages.openSidebarButton)}
    >
      {/* REV-2130 TODO: add logic for status "active" if red dot should display */}
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

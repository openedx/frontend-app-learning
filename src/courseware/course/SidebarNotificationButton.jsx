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
      onClick={() => { toggleSidebar(); }}
      alt={intl.formatMessage(messages.notificationButton)}
    >
      <div className="position-relative d-flex align-items-center" style={{ width: '2.4rem', height: '2rem' }}>
        <NotificationIcon status="active" notificationColor="bg-danger-500" />
      </div>
    </button>
  );
}

SidebarNotificationButton.propTypes = {
  intl: intlShape.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarVisible: PropTypes.func.isRequired,
};

export default injectIntl(SidebarNotificationButton);

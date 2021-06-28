import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import NotificationIcon from './NotificationIcon';
import messages from './messages';

function NotificationTrigger({ intl, toggleSidebar, isSidebarVisible }) {
  return (
    <button
      className={classNames('notification-trigger-btn', { active: isSidebarVisible() })}
      type="button"
      onClick={() => { toggleSidebar(); }}
      aria-label={intl.formatMessage(messages.openNotificationTrigger)}
    >
      {/* REV-2130 TODO: add logic for status "active" if red dot should display */}
      <NotificationIcon status="active" notificationColor="bg-danger-500" />
    </button>
  );
}

NotificationTrigger.propTypes = {
  intl: intlShape.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarVisible: PropTypes.func.isRequired,
};

export default injectIntl(NotificationTrigger);

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import NotificationIcon from './NotificationIcon';
import messages from './messages';

function NotificationTrigger({ intl, toggleNotificationTray, isNotificationTrayVisible }) {
  return (
    <button
      className={classNames('notification-trigger-btn', { active: isNotificationTrayVisible() })}
      type="button"
      onClick={() => { toggleNotificationTray(); }}
      aria-label={intl.formatMessage(messages.openNotificationTrigger)}
    >
      {/* REV-2297 TODO: add logic for status "active" if red dot should display */}
      <NotificationIcon status="inactive" notificationColor="bg-danger-500" />
    </button>
  );
}

NotificationTrigger.propTypes = {
  intl: intlShape.isRequired,
  toggleNotificationTray: PropTypes.func.isRequired,
  isNotificationTrayVisible: PropTypes.func.isRequired,
};

export default injectIntl(NotificationTrigger);

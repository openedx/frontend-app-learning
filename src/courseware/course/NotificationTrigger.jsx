import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getLocalStorage, setLocalStorage } from '../../data/localStorage';

import NotificationIcon from './NotificationIcon';
import messages from './messages';

function NotificationTrigger({
  intl, toggleNotificationTray, isNotificationTrayVisible, notificationStatus, setNotificationStatus,
  upgradeNotificationCurrentState,
}) {
  /* Re-show a red dot beside the notification trigger for each of the 7 UpgradeNotification stages
   The upgradeNotificationCurrentState prop will be available after UpgradeNotification mounts. Once available,
  compare with the last state they've seen, and if it's different then set dot back to red */
  function UpdateUpgradeNotificationLastSeen() {
    if (upgradeNotificationCurrentState) {
      if (getLocalStorage('upgradeNotificationLastSeen') !== upgradeNotificationCurrentState) {
        setNotificationStatus('active');
        setLocalStorage('notificationStatus', 'active');
        setLocalStorage('upgradeNotificationLastSeen', upgradeNotificationCurrentState);
      }
    }
  }

  useEffect(() => { UpdateUpgradeNotificationLastSeen(); });

  return (
    <button
      className={classNames('notification-trigger-btn', { 'trigger-active': isNotificationTrayVisible() })}
      type="button"
      onClick={() => { toggleNotificationTray(); }}
      aria-label={intl.formatMessage(messages.openNotificationTrigger)}
    >
      <NotificationIcon status={notificationStatus} notificationColor="bg-danger-500" />
    </button>
  );
}

NotificationTrigger.propTypes = {
  intl: intlShape.isRequired,
  toggleNotificationTray: PropTypes.func.isRequired,
  notificationStatus: PropTypes.string.isRequired,
  setNotificationStatus: PropTypes.func.isRequired,
  isNotificationTrayVisible: PropTypes.func.isRequired,
  upgradeNotificationCurrentState: PropTypes.string.isRequired,
};

export default injectIntl(NotificationTrigger);

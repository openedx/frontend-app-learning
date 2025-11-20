import { useContext, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { WIDGETS } from '@src/constants';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { getSessionStorage, setSessionStorage } from '@src/data/sessionStorage';
import messages from '../../../messages';
import SidebarTriggerBase from '../../common/TriggerBase';
import SidebarContext from '../../SidebarContext';
import NotificationIcon from './NotificationIcon';

export const ID = WIDGETS.NOTIFICATIONS;

const NotificationTrigger = ({
  onClick,
}) => {
  const intl = useIntl();
  const {
    courseId,
    notificationStatus,
    setNotificationStatus,
    currentSidebar,
    toggleSidebar,
    upgradeNotificationCurrentState,
  } = useContext(SidebarContext);

  /* Re-show a red dot beside the notification trigger for each of the 7 UpgradeNotification stages
   The upgradeNotificationCurrentState prop will be available after UpgradeNotification mounts. Once available,
  compare with the last state they've seen, and if it's different then set dot back to red */
  function UpdateUpgradeNotificationLastSeen() {
    if (upgradeNotificationCurrentState) {
      if (getLocalStorage(`upgradeNotificationLastSeen.${courseId}`) !== upgradeNotificationCurrentState) {
        setNotificationStatus('active');
        setLocalStorage(`notificationStatus.${courseId}`, 'active');
        setLocalStorage(`upgradeNotificationLastSeen.${courseId}`, upgradeNotificationCurrentState);
      }
    }
  }

  if (!getLocalStorage(`notificationStatus.${courseId}`)) {
    setLocalStorage(`notificationStatus.${courseId}`, 'active'); // Show red dot on notificationTrigger until seen
  }

  if (!getLocalStorage(`upgradeNotificationCurrentState.${courseId}`)) {
    setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'initialize');
  }

  useEffect(() => {
    UpdateUpgradeNotificationLastSeen();
    const notificationTrayStatus = getSessionStorage(`notificationTrayStatus.${courseId}`);
    const isNotificationTrayOpen = notificationTrayStatus === 'open';

    if (isNotificationTrayOpen && !currentSidebar) {
      if (toggleSidebar) {
        toggleSidebar(ID);
      }
    }
  }, [courseId, currentSidebar, ID]);

  const handleClick = () => {
    const isNotificationTrayOpen = getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open';

    if (isNotificationTrayOpen) {
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'closed');
    } else {
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'open');
    }

    onClick();
  };

  return (
    <SidebarTriggerBase onClick={handleClick} ariaLabel={intl.formatMessage(messages.openNotificationTrigger)}>
      <NotificationIcon status={notificationStatus} notificationColor="bg-danger-500" />
    </SidebarTriggerBase>
  );
};

NotificationTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default NotificationTrigger;

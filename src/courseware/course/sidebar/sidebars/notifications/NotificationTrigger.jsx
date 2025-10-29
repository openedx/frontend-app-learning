import {
  useContext, useEffect, useRef,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { WIDGETS } from '@src/constants';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
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
    sectionId,
    notificationStatus,
    setNotificationStatus,
    upgradeNotificationCurrentState,
    toggleSidebar,
    currentSidebar,
  } = useContext(SidebarContext);

  const sidebarTriggerBtnRef = useRef(null);

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
  });

  const handleClick = () => {
    if (toggleSidebar) {
      toggleSidebar(ID);
    }
    onClick();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      if (currentSidebar === ID) {
        event.preventDefault();
        sidebarTriggerBtnRef.current?.blur();
        sidebarTriggerBtnRef.current?.blur();

        sidebarTriggerBtnRef.current?.blur();

        const targetButton = document.querySelector('.sidebar-close-btn');
        targetButton?.focus();
      }
    }
  };

  const isOpen = currentSidebar === ID;

  return (
    <SidebarTriggerBase
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      isOpenNotificationStatusBar={isOpen}
      sectionId={sectionId}
      ref={sidebarTriggerBtnRef}
      ariaLabel={intl.formatMessage(messages.openNotificationTrigger)}
    >
      <NotificationIcon status={notificationStatus} notificationColor="bg-danger-500" />
    </SidebarTriggerBase>
  );
};

NotificationTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default NotificationTrigger;

import { useContext, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import SidebarTriggerBase from '@src/courseware/course/sidebar/common/TriggerBase';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { getSessionStorage, setSessionStorage } from '@src/data/sessionStorage';
import { useUpgradeWidgetContext } from './UpgradeWidgetContext';
import UpgradeIcon from './UpgradeIcon';
import messages from './messages';

export const ID = 'UPGRADE';

const UpgradeTrigger = ({ onClick }) => {
  const intl = useIntl();
  const { courseId, currentSidebar, toggleSidebar } = useContext(SidebarContext);
  const {
    upgradeWidgetStatus,
    setUpgradeWidgetStatus,
    upgradeCurrentState,
  } = useUpgradeWidgetContext();

  useEffect(() => {
    const isNotificationTrayOpen = getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open';

    if (isNotificationTrayOpen && !currentSidebar && toggleSidebar) {
      toggleSidebar(ID);
    }
  }, [courseId, currentSidebar, toggleSidebar]);

  useEffect(() => {
    if (!upgradeCurrentState) {
      return;
    }
    if (getLocalStorage(`upgradeWidgetLastSeen.${courseId}`) !== upgradeCurrentState) {
      // setUpgradeWidgetStatus already persists to localStorage via UpgradeWidgetContext
      setUpgradeWidgetStatus('active');
      setLocalStorage(`upgradeWidgetLastSeen.${courseId}`, upgradeCurrentState);
    }
  }, [upgradeCurrentState, courseId, setUpgradeWidgetStatus]);

  const handleClick = () => {
    const isNotificationTrayOpen = getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open';

    setSessionStorage(`notificationTrayStatus.${courseId}`, isNotificationTrayOpen ? 'closed' : 'open');
    onClick();
  };

  return (
    <SidebarTriggerBase onClick={handleClick} ariaLabel={intl.formatMessage(messages.openUpgradeTrigger)}>
      <UpgradeIcon status={upgradeWidgetStatus} upgradeColor="bg-danger-500" />
    </SidebarTriggerBase>
  );
};

UpgradeTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default UpgradeTrigger;

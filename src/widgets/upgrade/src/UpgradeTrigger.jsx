import { useContext, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import SidebarTriggerBase from '@src/courseware/course/sidebar/common/TriggerBase';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { useUpgradeWidgetContext } from './UpgradeWidgetContext';
import UpgradeIcon from './UpgradeIcon';
import messages from './messages';

export const ID = 'UPGRADE';

const UpgradeTrigger = ({ onClick }) => {
  const intl = useIntl();
  const { courseId } = useContext(SidebarContext);
  const {
    upgradeWidgetStatus,
    setUpgradeWidgetStatus,
    upgradeCurrentState,
  } = useUpgradeWidgetContext();

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

  return (
    <SidebarTriggerBase onClick={onClick} ariaLabel={intl.formatMessage(messages.openUpgradeTrigger)}>
      <UpgradeIcon status={upgradeWidgetStatus} upgradeColor="bg-danger-500" />
    </SidebarTriggerBase>
  );
};

UpgradeTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default UpgradeTrigger;

import UpgradePanel from './UpgradePanel';
import UpgradeTrigger, { ID } from './UpgradeTrigger';
import { UpgradeWidgetProvider } from './UpgradeWidgetContext';
import { upgradeIsAvailable } from './utils';

export const upgradeWidgetConfig = {
  id: ID,
  priority: 20,
  Sidebar: UpgradePanel,
  Trigger: UpgradeTrigger,
  Provider: UpgradeWidgetProvider,
  isAvailable: upgradeIsAvailable,
  enabled: true,
};

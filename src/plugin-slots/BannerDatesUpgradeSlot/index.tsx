import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import UpgradeToCompleteAlert from '../../course-home/suggested-schedule-messaging/UpgradeToCompleteAlert';

export const BannerDatesUpgradeSlot = ({
  courseId,
  logUpgradeLinkClick,
}: BannerDatesUpgradeSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.banner_dates_upgrade.v1"
    pluginProps={{
      courseId,
      logUpgradeLinkClick,
    }}
  >
    <UpgradeToCompleteAlert logUpgradeLinkClick={logUpgradeLinkClick} />
  </PluginSlot>
);

interface BannerDatesUpgradeSlotProps {
  courseId: string;
  logUpgradeLinkClick: () => void;
}

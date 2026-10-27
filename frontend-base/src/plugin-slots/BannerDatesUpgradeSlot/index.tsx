import React from 'react';

import UpgradeToCompleteAlert from '../../course-home/suggested-schedule-messaging/UpgradeToCompleteAlert';

// https://github.com/openedx/frontend-app-learning/issues/2185
export const BannerDatesUpgradeSlot = ({
  logUpgradeLinkClick,
}: BannerDatesUpgradeSlotProps) => (
  <>
    <UpgradeToCompleteAlert logUpgradeLinkClick={logUpgradeLinkClick} />
  </>
);

interface BannerDatesUpgradeSlotProps {
  courseId: string;
  logUpgradeLinkClick: () => void;
}

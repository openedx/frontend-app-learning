import { Slot } from '@openedx/frontend-base';

import UpgradeToCompleteAlert from '@src/course-home/dates-tab/UpgradeToCompleteAlert';

export const bannerDatesUpgradeSlotId = 'org.openedx.frontend.slot.learning.bannerDatesUpgrade.v1';

export interface BannerDatesUpgradeSlotProps {
  courseId: string;
  logUpgradeLinkClick: () => void;
}

const BannerDatesUpgradeSlot = ({ courseId, logUpgradeLinkClick }: BannerDatesUpgradeSlotProps) => (
  <Slot id={bannerDatesUpgradeSlotId} courseId={courseId} logUpgradeLinkClick={logUpgradeLinkClick}>
    <UpgradeToCompleteAlert logUpgradeLinkClick={logUpgradeLinkClick} />
  </Slot>
);

export default BannerDatesUpgradeSlot;

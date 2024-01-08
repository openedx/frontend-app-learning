import React, { useContext, useEffect } from 'react';

import { useModel } from '../../../../../../generic/model-store';
import UpgradeNotification from '../../../../../../generic/upgrade-notification/UpgradeNotification';
import WIDGETS from '../../../constants';
import SidebarContext from '../../../SidebarContext';

const NotificationsWidget = () => {
  const {
    courseId,
    onNotificationSeen,
    upgradeNotificationCurrentState,
    setUpgradeNotificationCurrentState,
    hideNotificationbar,
    toggleSidebar,
    isNotificationbarAvailable,
    currentSidebar,
  } = useContext(SidebarContext);
  const course = useModel('coursewareMeta', courseId);

  const {
    accessExpiration,
    contentTypeGatingEnabled,
    marketingUrl,
    offer,
    timeOffsetMillis,
    userTimezone,
  } = course;

  const {
    org,
    verifiedMode,
  } = useModel('courseHomeMeta', courseId);

  // After three seconds, update notificationSeen (to hide red dot)
  useEffect(() => { setTimeout(onNotificationSeen, 3000); }, []);

  if (hideNotificationbar || !isNotificationbarAvailable) { return null; }

  return (
    <div className="border border-light-400 rounded-sm" data-testid="notification-widget">
      <UpgradeNotification
        offer={offer}
        verifiedMode={verifiedMode}
        accessExpiration={accessExpiration}
        contentTypeGatingEnabled={contentTypeGatingEnabled}
        marketingUrl={marketingUrl}
        upsellPageName="in_course"
        userTimezone={userTimezone}
        shouldDisplayBorder={false}
        timeOffsetMillis={timeOffsetMillis}
        courseId={courseId}
        org={org}
        upgradeNotificationCurrentState={upgradeNotificationCurrentState}
        setupgradeNotificationCurrentState={setUpgradeNotificationCurrentState}
        toggleSidebar={() => toggleSidebar(currentSidebar, WIDGETS.NOTIFICATIONS)}
      />
    </div>
  );
};

export default NotificationsWidget;

import { useIntl } from '@edx/frontend-platform/i18n';
import React, { useContext, useEffect } from 'react';
import { useModel } from '../../../../../../generic/model-store';
import UpgradeNotification from '../../../../../../generic/upgrade-notification/UpgradeNotification';
import messages from '../../../messages';
import SidebarContext from '../../../SidebarContext';

const NotificationsWidget = () => {
  const intl = useIntl();
  const {
    courseId,
    onNotificationSeen,
    upgradeNotificationCurrentState,
    setUpgradeNotificationCurrentState,
    hideNotificationbar,
    toggleSidebar,
    isNotificationbarAvailable,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setTimeout(onNotificationSeen, 3000); }, []);

  if (hideNotificationbar || !isNotificationbarAvailable) { return null; }

  return (
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
      showRemoveIcon
      sidebarId="qqw"
      toggleSidebar={toggleSidebar}
      tabId={intl.formatMessage(messages.notificationTitle)}
    />
  );
};

export default NotificationsWidget;

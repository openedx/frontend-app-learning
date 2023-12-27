import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import React, { useContext, useEffect } from 'react';
import { useModel } from '../../../../../generic/model-store';
import UpgradeNotification from '../../../../../generic/upgrade-notification/UpgradeNotification';
import { SidebarID } from '../../constants';
import messages from '../../messages';
import SidebarBase from '../../common/SidebarBase';
import SidebarContext from '../../SidebarContext';

const NotificationTray = ({ intl }) => {
  const {
    courseId,
    onNotificationSeen,
    shouldDisplayFullScreen,
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
    <SidebarBase
      title={intl.formatMessage(messages.notificationTitle)}
      ariaLabel={intl.formatMessage(messages.notificationTray)}
      sidebarId={SidebarID}
      className={classNames({ 'h-100': !verifiedMode && !shouldDisplayFullScreen, 'mb-3': true })}
      showTitleBar={false}
    >
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
        sidebarId={SidebarID}
        toggleSidebar={toggleSidebar}
        tabId={intl.formatMessage(messages.notificationTitle)}
      />
    </SidebarBase>
  );
};

NotificationTray.propTypes = {
  intl: intlShape.isRequired,
};

NotificationTray.Trigger = NotificationTray;

export default injectIntl(NotificationTray);

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import { useContext, useEffect, useMemo } from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useModel } from '@src/generic/model-store';
import UpgradeNotification from '../../../../../generic/upgrade-notification/UpgradeNotification';

import messages from '../../../messages';
import SidebarBase from '../../common/SidebarBase';
import SidebarContext from '../../SidebarContext';
import NotificationTrigger, { ID } from './NotificationTrigger';

const NotificationTray = ({ intl }) => {
  const {
    courseId,
    onNotificationSeen,
    shouldDisplayFullScreen,
    upgradeNotificationCurrentState,
    setUpgradeNotificationCurrentState,
  } = useContext(SidebarContext);
  const course = useModel('coursewareMeta', courseId);

  const {
    accessExpiration,
    contentTypeGatingEnabled,
    end,
    enrollmentEnd,
    enrollmentMode,
    enrollmentStart,
    marketingUrl,
    offer,
    start,
    timeOffsetMillis,
    userTimezone,
    verificationStatus,
  } = course;

  const {
    courseModes,
    org,
    verifiedMode,
    username,
    isStaff,
  } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();
  const activeCourseModes = useMemo(() => courseModes?.map(mode => mode.slug), [courseModes]);
  const notificationTrayEventProperties = {
    course_end: end,
    course_modes: activeCourseModes,
    course_start: start,
    courserun_key: courseId,
    enrollment_end: enrollmentEnd,
    enrollment_mode: enrollmentMode,
    enrollment_start: enrollmentStart,
    is_upgrade_notification_visible: !!verifiedMode,
    name: 'Old Sidebar Notification Tray',
    org_key: org,
    username,
    verification_status: verificationStatus,
    is_staff: isStaff,
    is_admin: administrator,
  };
  // After three seconds, update notificationSeen (to hide red dot)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    setTimeout(onNotificationSeen, 3000);
    sendTrackEvent('edx.ui.course.upgrade.old_sidebar.notifications', notificationTrayEventProperties);
  }, []);

  return (
    <SidebarBase
      title={intl.formatMessage(messages.notificationTitle)}
      ariaLabel={intl.formatMessage(messages.notificationTray)}
      sidebarId={ID}
      width="45rem"
      className={classNames({
        'h-100': !verifiedMode && !shouldDisplayFullScreen,
        'ml-4': !shouldDisplayFullScreen,
      })}
    >
      <div>{verifiedMode
        ? (
          <PluginSlot
            id="notification_tray_slot"
            pluginProps={{
              courseId,
              model: 'coursewareMeta',
              notificationCurrentState: upgradeNotificationCurrentState,
              setNotificationCurrentState: setUpgradeNotificationCurrentState,
            }}
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
            />
          </PluginSlot>
        ) : (
          <p className="p-3 small">{intl.formatMessage(messages.noNotificationsMessage)}</p>
        )}
      </div>
    </SidebarBase>
  );
};

NotificationTray.propTypes = {
  intl: intlShape.isRequired,
};

NotificationTray.Trigger = NotificationTrigger;
NotificationTray.ID = ID;

export default injectIntl(NotificationTray);

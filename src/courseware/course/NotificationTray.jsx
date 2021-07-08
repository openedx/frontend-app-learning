import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { ArrowBackIos, Close } from '@edx/paragon/icons';

import messages from './messages';
import { useModel } from '../../generic/model-store';
import useWindowSize, { responsiveBreakpoints } from '../../generic/tabs/useWindowSize';
import UpgradeNotification from '../../generic/upgrade-notification/UpgradeNotification';

function NotificationTray({
  intl, toggleNotificationTray,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseware);

  const course = useModel('coursewareMeta', courseId);

  const {
    accessExpiration,
    contentTypeGatingEnabled,
    offer,
    org,
    timeOffsetMillis,
    userTimezone,
    verifiedMode,
  } = course;

  const shouldDisplayFullScreen = useWindowSize().width < responsiveBreakpoints.large.minWidth;

  return (
    <section className={classNames('notification-tray-container ml-0 ml-lg-4', { 'no-notification': !verifiedMode && !shouldDisplayFullScreen })} aria-label={intl.formatMessage(messages.notificationTray)}>
      {shouldDisplayFullScreen ? (
        <div className="mobile-close-container" onClick={() => { toggleNotificationTray(); }} onKeyDown={() => { toggleNotificationTray(); }} role="button" tabIndex="0" alt={intl.formatMessage(messages.responsiveCloseNotificationTray)}>
          <Icon src={ArrowBackIos} />
          <span className="mobile-close">{intl.formatMessage(messages.responsiveCloseNotificationTray)}</span>
        </div>
      ) : null}
      <div>
        <span className="notification-tray-title">{intl.formatMessage(messages.notificationTitle)}</span>
        {shouldDisplayFullScreen
          ? null
          : (
            <div className="d-inline-flex close-btn">
              <IconButton src={Close} size="sm" iconAs={Icon} onClick={() => { toggleNotificationTray(); }} variant="primary" alt={intl.formatMessage(messages.closeNotificationTrigger)} />
            </div>
          )}
      </div>
      <div className="notification-tray-divider" />
      <div>{verifiedMode
        ? (
          <UpgradeNotification
            offer={offer}
            verifiedMode={verifiedMode}
            accessExpiration={accessExpiration}
            contentTypeGatingEnabled={contentTypeGatingEnabled}
            userTimezone={userTimezone}
            timeOffsetMillis={timeOffsetMillis}
            courseId={courseId}
            org={org}
            shouldDisplayBorder={false}
          />
        ) : <p className="notification-tray-content">{intl.formatMessage(messages.noNotificationsMessage)}</p>}
      </div>
    </section>
  );
}

NotificationTray.propTypes = {
  intl: intlShape.isRequired,
  toggleNotificationTray: PropTypes.func,
};

NotificationTray.defaultProps = {
  toggleNotificationTray: null,
};

export default injectIntl(NotificationTray);

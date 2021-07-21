import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { WatchOutline } from '@edx/paragon/icons';

import messages from './messages';

function NotificationIcon({ intl, status, notificationColor }) {
  return (
    <div className="icon-container">
      <Icon src={WatchOutline} className="m-0 m-auto" alt={intl.formatMessage(messages.openNotificationTrigger)} />
      {status === 'active'
        ? <span className={classNames(notificationColor, 'notification-dot')} data-testid="notification-dot" />
        : null}
    </div>
  );
}

NotificationIcon.propTypes = {
  intl: intlShape.isRequired,
  status: PropTypes.string.isRequired,
  notificationColor: PropTypes.string.isRequired,
};

export default injectIntl(NotificationIcon);

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { WatchOutline } from '@edx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import messages from '../../../messages';

function NotificationIcon({
  intl,
  status,
  notificationColor,
}) {
  return (
    <>
      <Icon src={WatchOutline} className="m-0 m-auto" alt={intl.formatMessage(messages.openNotificationTrigger)} />
      {status === 'active'
        ? (
          <span
            className={classNames(notificationColor, 'rounded-circle p-1 position-absolute')}
            data-testid="notification-dot"
            style={{
              top: '0.3rem',
              right: '0.55rem',
            }}
          />
        )
        : null}
    </>
  );
}

NotificationIcon.propTypes = {
  intl: intlShape.isRequired,
  status: PropTypes.string.isRequired,
  notificationColor: PropTypes.string.isRequired,
};

export default injectIntl(NotificationIcon);

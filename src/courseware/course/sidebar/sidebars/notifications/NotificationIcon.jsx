import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import messages from '../../../messages';
import { NotificationIcon as NotifIcon } from '../../../../../Icons';

const NotificationIcon = ({
  intl,
  status,
  notificationColor,
}) => (
  <>
    <span className="sr-only">{intl.formatMessage(messages.openNotificationTrigger)}</span>
    <NotifIcon className="m-0 m-auto" />
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

NotificationIcon.propTypes = {
  intl: intlShape.isRequired,
  status: PropTypes.string.isRequired,
  notificationColor: PropTypes.string.isRequired,
};

export default injectIntl(NotificationIcon);

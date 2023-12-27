import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { RightSidebarFilled, RightSidebarOutlined } from './icons/index';
import SidebarContext from './SidebarContext';
import messages from '../messages';

const SidebarIcon = ({
  intl,
  status,
  sidebarColor,
}) => {
  const { currentSidebar } = useContext(SidebarContext);
  return (
    <>
      <Icon src={currentSidebar ? RightSidebarFilled : RightSidebarOutlined} className="m-0 m-auto" alt={intl.formatMessage(messages.openNotificationTrigger)} />
      {status === 'active'
        ? (
          <span
            className={classNames(sidebarColor, 'rounded-circle p-1 position-absolute')}
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
};

SidebarIcon.propTypes = {
  intl: intlShape.isRequired,
  status: PropTypes.string.isRequired,
  sidebarColor: PropTypes.string.isRequired,
};

export default injectIntl(SidebarIcon);

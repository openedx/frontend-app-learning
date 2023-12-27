import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import React, { useContext } from 'react';
import { RightSidebarFilled, RightSidebarOutlined } from './icons';
import SidebarContext from './SidebarContext';
import messages from '../messages';

const SidebarIcon = () => {
  const intl = useIntl();
  const { currentSidebar } = useContext(SidebarContext);

  return (
    <Icon
      src={currentSidebar ? RightSidebarFilled : RightSidebarOutlined}
      className="m-0 m-auto"
      alt={intl.formatMessage(messages.openNotificationTrigger)}
    />
  );
};

SidebarIcon.propTypes = { };

export default SidebarIcon;

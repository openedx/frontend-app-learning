import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { ArrowBackIos, Close } from '@edx/paragon/icons';
import './Sidebar.scss';
import messages from './messages';
import useWindowSize from '../../generic/tabs/useWindowSize';

function Sidebar({
  intl, toggleSidebar,
}) {
  const shouldDisplayFullScreen = useWindowSize().width < 992;
  return (
    <section className="sidebar-container ml-0 ml-lg-4" aria-label={intl.formatMessage(messages.sidebarNotification)}>
      {shouldDisplayFullScreen ? (
        <div className="mobile-close-container" onClick={() => { toggleSidebar(); }} onKeyDown={() => { toggleSidebar(); }} role="button" tabIndex="0" alt={intl.formatMessage(messages.responsiveCloseSidebar)}>
          <Icon src={ArrowBackIos} />
          <span className="mobile-close">{intl.formatMessage(messages.responsiveCloseSidebar)}</span>
        </div>
      ) : null}
      <div className="sidebar-header px-3">
        <span>{intl.formatMessage(messages.notificationTitle)}</span>
        {shouldDisplayFullScreen
          ? null
          : <Icon src={Close} className="close-btn" onClick={() => { toggleSidebar(); }} onKeyDown={() => { toggleSidebar(); }} role="button" tabIndex="0" alt={intl.formatMessage(messages.closeSidebarButton)} />}
      </div>
      <div className="sidebar-divider" />
      <div className="sidebar-content">
        {/* REV-2130 TODO: add conditional here to display expiration box or display below message */}
        <p>{intl.formatMessage(messages.noNotificationsMessage)}</p>
      </div>
    </section>
  );
}

Sidebar.propTypes = {
  intl: intlShape.isRequired,
  toggleSidebar: PropTypes.func,
};

Sidebar.defaultProps = {
  toggleSidebar: null,
};

export default injectIntl(Sidebar);

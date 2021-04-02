import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { ArrowBackIos, Close } from '@edx/paragon/icons';
import './Sidebar.scss';
import messages from './messages';

function Sidebar({
  intl, sidebarVisible, toggleSidebar, isTabletWidth,
}) {
  return (
    sidebarVisible ? (
      <div className="sidebar-container ml-0 ml-lg-4">
        {isTabletWidth
          ? (
            <div className="mobile-close-container" onClick={() => { toggleSidebar(); }} onKeyDown={() => { toggleSidebar(); }} role="button" tabIndex="0" alt={intl.formatMessage(messages.responsiveCloseSidebar)}>
              <Icon src={ArrowBackIos} />
              <span className="mobile-close">{intl.formatMessage(messages.responsiveCloseSidebar)}</span>
            </div>
          )
          : null}
        <div className="sidebar-header px-3">
          <span>{intl.formatMessage(messages.notification)}</span>
          {!isTabletWidth
            ? <Icon src={Close} className="close-btn" onClick={() => { toggleSidebar(); }} onKeyDown={() => { toggleSidebar(); }} role="button" tabIndex="0" alt={intl.formatMessage(messages.closeButton)} />
            : null}
        </div>
        <div className="sidebar-divider" />
        <div className="sidebar-content">
          {/* JK: add conditional here */}
          <p>You have no new notifications at this time.</p>
          {/* expiration box to be inserted here */}
        </div>
      </div>
    ) : null
  );
}

Sidebar.propTypes = {
  intl: intlShape.isRequired,
  toggleSidebar: PropTypes.func,
  sidebarVisible: PropTypes.bool,
  isTabletWidth: PropTypes.bool,
};

Sidebar.defaultProps = {
  toggleSidebar: null,
  sidebarVisible: null,
  isTabletWidth: null,
};

export default injectIntl(Sidebar);

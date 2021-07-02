import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { ArrowBackIos, Close } from '@edx/paragon/icons';

import messages from './messages';
import { useModel } from '../../generic/model-store';
import useWindowSize, { responsiveBreakpoints } from '../../generic/tabs/useWindowSize';
import UpgradeCard from '../../generic/upgrade-card/UpgradeCard';

function Sidebar({
  intl, toggleSidebar,
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
    <section className={classNames('sidebar-container ml-0 ml-lg-4', { 'no-notification': !verifiedMode && !shouldDisplayFullScreen })} aria-label={intl.formatMessage(messages.sidebarNotification)}>
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
      <div>{verifiedMode
        ? (
          <UpgradeCard
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
        ) : <p className="sidebar-content">{intl.formatMessage(messages.noNotificationsMessage)}</p>}
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

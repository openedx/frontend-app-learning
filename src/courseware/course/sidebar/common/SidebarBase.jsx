import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { ArrowBackIos, Close } from '@edx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { useEventListener } from '../../../../generic/hooks';
import messages from '../../messages';
import SidebarContext from '../SidebarContext';

function SidebarBase({
  intl,
  title,
  ariaLabel,
  sidebarId,
  className,
  children,
  showTitleBar,
  width,
}) {
  const {
    toggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
  } = useContext(SidebarContext);

  const receiveMessage = useCallback(({ data }) => {
    const { type } = data;
    if (type === 'learning.events.sidebar.close') {
      toggleSidebar(null);
    }
  }, [sidebarId, toggleSidebar]);

  useEventListener('message', receiveMessage);

  return currentSidebar === sidebarId && (
    <section
      className={classNames('ml-0 ml-lg-4 border border-light-400 rounded-sm h-auto align-top', {
        'bg-white m-0 border-0 fixed-top vh-100 rounded-0': shouldDisplayFullScreen,
      }, className)}
      style={{ width: shouldDisplayFullScreen ? '100%' : width }}
      aria-label={ariaLabel}
    >
      {shouldDisplayFullScreen ? (
        <div
          className="pt-2 pb-2.5 border-bottom border-light-400 d-flex align-items-center ml-2"
          onClick={() => toggleSidebar(null)}
          onKeyDown={() => toggleSidebar(null)}
          role="button"
          tabIndex="0"
          alt={intl.formatMessage(messages.responsiveCloseNotificationTray)}
        >
          <Icon src={ArrowBackIos} />
          <span className="font-weight-bold m-2 d-inline-block">
            {intl.formatMessage(messages.responsiveCloseNotificationTray)}
          </span>
        </div>
      ) : null}
      {showTitleBar && (
        <>
          <div className="d-flex align-items-center">
            <span className="p-2.5 d-inline-block">{title}</span>
            {shouldDisplayFullScreen
              ? null
              : (
                <div className="d-inline-flex mr-2 mt-1.5 ml-auto">
                  <IconButton
                    src={Close}
                    size="sm"
                    iconAs={Icon}
                    onClick={() => toggleSidebar(null)}
                    variant="primary"
                    alt={intl.formatMessage(messages.closeNotificationTrigger)}
                  />
                </div>
              )}
          </div>
          <div className="py-1 bg-gray-100 border-top border-bottom border-light-400" />
        </>
      )}
      {children}
    </section>
  );
}

SidebarBase.propTypes = {
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  sidebarId: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.element.isRequired,
  showTitleBar: PropTypes.bool,
  width: PropTypes.string,
};

SidebarBase.defaultProps = {
  width: '31rem',
  showTitleBar: true,
  className: '',
};

export default injectIntl(SidebarBase);

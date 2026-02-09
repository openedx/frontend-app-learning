import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { ArrowBackIos, Close } from '@openedx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {
  useCallback, useContext,
} from 'react';

import { useEventListener } from '@src/generic/hooks';
import messages from '@src/courseware/course/messages';
import SidebarContext from '../SidebarContext';
import { useSidebarFocusAndKeyboard } from './hooks/useSidebarFocusAndKeyboard';

const SidebarBase = ({
  title,
  ariaLabel,
  sidebarId,
  className,
  children,
  showTitleBar,
  width,
}) => {
  const intl = useIntl();
  const {
    toggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
  } = useContext(SidebarContext);

  const {
    closeBtnRef,
    backBtnRef,
    handleClose,
    handleKeyDown,
    handleBackBtnKeyDown,
  } = useSidebarFocusAndKeyboard(sidebarId);

  const isOpen = currentSidebar === sidebarId;

  const receiveMessage = useCallback(({ data }) => {
    const { type } = data;
    if (type === 'learning.events.sidebar.close') {
      toggleSidebar(null);
    }
  }, [toggleSidebar]);

  useEventListener('message', receiveMessage);

  return (
    <section
      className={classNames('ml-0 border border-light-400 rounded-sm h-auto align-top zindex-0', {
        'bg-white m-0 border-0 fixed-top vh-100 rounded-0': shouldDisplayFullScreen,
        'align-self-start': !shouldDisplayFullScreen,
        'd-none': !isOpen,
      }, className)}
      data-testid={`sidebar-${sidebarId}`}
      style={{ width: shouldDisplayFullScreen ? '100%' : width }}
      aria-label={ariaLabel}
      id="course-sidebar"
    >
      {shouldDisplayFullScreen ? (
        <div
          className="pt-2 pb-2.5 border-bottom border-light-400 d-flex align-items-center ml-2"
          onClick={handleClose}
          onKeyDown={handleBackBtnKeyDown}
          role="button"
          ref={backBtnRef}
          tabIndex="0"
        >
          <Icon src={ArrowBackIos} />
          <span className="font-weight-bold m-2 d-inline-block">
            {intl.formatMessage(messages.responsiveCloseNotificationTray)}
          </span>
        </div>
      ) : null}
      {showTitleBar && (
        <>
          <div className="d-flex align-items-center mb-2">
            <h2 className="p-2.5 d-inline-block m-0 text-gray-700 h4">{title}</h2>
            {shouldDisplayFullScreen
              ? null
              : (
                <div className="d-inline-flex mr-2 ml-auto">
                  <IconButton
                    className="sidebar-close-btn"
                    src={Close}
                    size="sm"
                    ref={closeBtnRef}
                    iconAs={Icon}
                    onClick={handleClose}
                    onKeyDown={handleKeyDown}
                    variant="primary"
                    alt={intl.formatMessage(messages.closeNotificationTrigger)}
                  />
                </div>
              )}
          </div>
        </>
      )}
      {children}
    </section>
  );
};

SidebarBase.propTypes = {
  title: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  sidebarId: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  showTitleBar: PropTypes.bool,
  width: PropTypes.string,
};

SidebarBase.defaultProps = {
  width: '31rem',
  showTitleBar: true,
};

export default SidebarBase;

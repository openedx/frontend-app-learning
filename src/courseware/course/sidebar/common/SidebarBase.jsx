import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { ArrowBackIos, Close } from '@openedx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {
  useCallback, useContext, useEffect, useRef,
} from 'react';

import { useEventListener } from '@src/generic/hooks';
import { setSessionStorage, getSessionStorage } from '@src/data/sessionStorage';
import messages from '../../messages';
import SidebarContext from '../SidebarContext';

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
    courseId,
    toggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
  } = useContext(SidebarContext);

  const closeBtnRef = useRef(null);
  const responsiveCloseNotificationTrayRef = useRef(null);
  const isOpenNotificationTray = getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open';
  const isFocusedNotificationTray = getSessionStorage(`notificationTrayFocus.${courseId}`) === 'true';

  useEffect(() => {
    if (isOpenNotificationTray && isFocusedNotificationTray && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }

    if (shouldDisplayFullScreen) {
      responsiveCloseNotificationTrayRef.current?.focus();
    }
  });

  const receiveMessage = useCallback(({ data }) => {
    const { type } = data;
    if (type === 'learning.events.sidebar.close') {
      toggleSidebar(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleSidebar]);

  useEventListener('message', receiveMessage);

  const focusSidebarTriggerBtn = () => {
    const performFocus = () => {
      const sidebarTriggerBtn = document.querySelector('.sidebar-trigger-btn');
      if (sidebarTriggerBtn) {
        sidebarTriggerBtn.focus();
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(performFocus);
    });
  };

  const handleCloseNotificationTray = () => {
    toggleSidebar(null);
    setSessionStorage(`notificationTrayFocus.${courseId}`, 'true');
    setSessionStorage(`notificationTrayStatus.${courseId}`, 'closed');
    focusSidebarTriggerBtn();
  };

  const handleKeyDown = useCallback((event) => {
    const { key, shiftKey, target } = event;

    if (key !== 'Tab' || target !== closeBtnRef.current) {
      return;
    }

    // Shift + Tab
    if (shiftKey) {
      event.preventDefault();
      focusSidebarTriggerBtn();
      return;
    }

    // Tab
    const courseOutlineTrigger = document.querySelector('#courseOutlineTrigger');
    if (courseOutlineTrigger) {
      event.preventDefault();
      courseOutlineTrigger.focus();
      return;
    }

    const leftArrow = document.querySelector('.previous-button');
    if (leftArrow && !leftArrow.disabled) {
      event.preventDefault();
      leftArrow.focus();
      return;
    }

    const rightArrow = document.querySelector('.next-button');
    if (rightArrow && !rightArrow.disabled) {
      event.preventDefault();
      rightArrow.focus();
    }
  }, [focusSidebarTriggerBtn, closeBtnRef]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleKeyDownNotificationTray = (event) => {
    const { key, shiftKey } = event;
    const currentElement = event.target === responsiveCloseNotificationTrayRef.current;
    const sidebarTriggerBtn = document.querySelector('.call-to-action-btn');

    switch (key) {
      case 'Enter':
        if (currentElement) {
          handleCloseNotificationTray();
        }
        break;

      case 'Tab':
        if (!shiftKey && sidebarTriggerBtn) {
          event.preventDefault();
          sidebarTriggerBtn.focus();
        } else if (shiftKey) {
          event.preventDefault();
          responsiveCloseNotificationTrayRef.current?.focus();
        }
        break;

      default:
        break;
    }
  };

  return (
    <section
      className={classNames('ml-0 border border-light-400 rounded-sm h-auto align-top zindex-0', {
        'bg-white m-0 border-0 fixed-top vh-100 rounded-0': shouldDisplayFullScreen,
        'align-self-start': !shouldDisplayFullScreen,
        'd-none': currentSidebar !== sidebarId,
      }, className)}
      data-testid={`sidebar-${sidebarId}`}
      style={{ width: shouldDisplayFullScreen ? '100%' : width }}
      aria-label={ariaLabel}
      id="course-sidebar"
    >
      {shouldDisplayFullScreen ? (
        <div
          className="pt-2 pb-2.5 border-bottom border-light-400 d-flex align-items-center ml-2"
          onClick={handleCloseNotificationTray}
          onKeyDown={handleKeyDownNotificationTray}
          role="button"
          ref={responsiveCloseNotificationTrayRef}
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
            {/* TODO: view this title in UI and decide */}
            {/* <strong className="p-2.5 d-inline-block course-sidebar-title">{title}</strong> */}
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
                    onClick={handleCloseNotificationTray}
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

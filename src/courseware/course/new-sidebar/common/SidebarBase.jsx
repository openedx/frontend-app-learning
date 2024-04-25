import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { ArrowBackIos, Close } from '@openedx/paragon/icons';

import { useEventListener } from '../../../../generic/hooks';
import { WIDGETS } from '../../../../constants';
import messages from '../messages';
import SidebarContext from '../SidebarContext';

const SidebarBase = ({
  title,
  ariaLabel,
  sidebarId,
  className,
  children,
  showTitleBar,
  width,
  allowFullHeight,
  showBorder,
}) => {
  const intl = useIntl();
  const {
    toggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
  } = useContext(SidebarContext);

  const receiveMessage = useCallback(({ data }) => {
    const { type } = data;
    if (type === 'learning.events.sidebar.close') {
      toggleSidebar(currentSidebar, WIDGETS.DISCUSSIONS);
    }
  }, [toggleSidebar]);

  useEventListener('message', receiveMessage);

  return (
    <section
      className={classNames('ml-0 ml-lg-4 h-auto align-top zindex-0', {
        'min-vh-100': !shouldDisplayFullScreen && allowFullHeight,
        'bg-white m-0 border-0 fixed-top vh-100 rounded-0': shouldDisplayFullScreen,
        'd-none': currentSidebar !== sidebarId,
        'border border-light-400 rounded-sm': showBorder,
      }, className)}
      data-testid={`sidebar-${sidebarId}`}
      style={{ width: shouldDisplayFullScreen ? '100%' : width }}
      aria-label={ariaLabel}
    >
      {shouldDisplayFullScreen
        && (
        <div
          className="pt-2 pb-2.5 border-bottom border-light-400 d-flex align-items-center ml-2"
          onClick={() => toggleSidebar(null)}
          onKeyDown={() => toggleSidebar(null)}
          role="button"
          tabIndex="0"
          alt={intl.formatMessage(messages.responsiveCloseSidebarTray)}
        >
          <Icon src={ArrowBackIos} />
          <span className="font-weight-bold m-2 d-inline-block">
            {intl.formatMessage(messages.responsiveCloseSidebarTray)}
          </span>
        </div>
        )}
      {showTitleBar && (
        <>
          <div className="d-flex align-items-center">
            <span className="p-2.5 d-inline-block">{title}</span>
            <div className="d-inline-flex mr-2 mt-1.5 ml-auto">
              <IconButton
                src={Close}
                size="sm"
                iconAs={Icon}
                onClick={() => toggleSidebar(sidebarId)}
                alt={intl.formatMessage(messages.closeTrigger)}
                className="icon-hover"
              />
            </div>
          </div>
          <div className="py-1 bg-gray-100 border-top border-bottom border-light-400" />
        </>
      )}
      {children}
    </section>
  );
};

SidebarBase.propTypes = {
  title: PropTypes.string,
  ariaLabel: PropTypes.string.isRequired,
  sidebarId: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.element.isRequired,
  showTitleBar: PropTypes.bool,
  width: PropTypes.string,
  allowFullHeight: PropTypes.bool,
  showBorder: PropTypes.bool,
};

SidebarBase.defaultProps = {
  title: '',
  width: '50rem',
  allowFullHeight: false,
  showTitleBar: true,
  className: '',
  showBorder: true,
};

export default SidebarBase;

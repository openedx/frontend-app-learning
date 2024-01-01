import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { useEventListener } from '../../../../generic/hooks';
import messages from '../messages';
import SidebarContext from '../SidebarContext';

const SidebarBase = ({
  intl,
  title,
  ariaLabel,
  sidebarId,
  className,
  children,
  showTitleBar,
  width,
  allowFullHeight,
}) => {
  const {
    toggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
  } = useContext(SidebarContext);

  const receiveMessage = useCallback(({ data }) => {
    const { type } = data;
    if (type === 'learning.events.sidebar.close') {
      toggleSidebar(sidebarId, 'Discussions');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleSidebar]);

  useEventListener('message', receiveMessage);

  return (
    <section
      className={classNames('ml-0 ml-lg-4 border border-light-400 rounded-sm h-auto align-top', {
        'min-vh-100': !shouldDisplayFullScreen && allowFullHeight,
        'd-none': currentSidebar !== sidebarId,
      }, className)}
      data-testid={`sidebar-${sidebarId}`}
      style={{ width: shouldDisplayFullScreen ? '100%' : width }}
      aria-label={ariaLabel}
    >
      {showTitleBar && (
        <>
          <div className="d-flex align-items-center">
            <span className="p-2.5 d-inline-block">{title}</span>
            <div className="d-inline-flex mr-2 mt-1.5 ml-auto">
              <IconButton
                src={Close}
                size="sm"
                iconAs={Icon}
                onClick={() => toggleSidebar(sidebarId, title)}
                alt={intl.formatMessage(messages.closeNotificationTrigger)}
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
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  sidebarId: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.element.isRequired,
  showTitleBar: PropTypes.bool,
  width: PropTypes.string,
  allowFullHeight: PropTypes.bool,
};

SidebarBase.defaultProps = {
  width: '31rem',
  allowFullHeight: false,
  showTitleBar: true,
  className: '',
};

export default injectIntl(SidebarBase);

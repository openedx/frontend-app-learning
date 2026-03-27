import PropTypes from 'prop-types';
import { forwardRef } from 'react';

const SidebarTriggerBase = forwardRef(({
  onClick,
  onKeyDown,
  ariaLabel,
  children,
  isOpenNotificationStatusBar,
  sectionId,
}, ref) => (
  <button
    className="border border-light-400 bg-transparent align-items-center align-content-center d-flex notification-btn sidebar-trigger-btn"
    type="button"
    onClick={onClick}
    onKeyDown={onKeyDown}
    aria-label={ariaLabel}
    aria-expanded={isOpenNotificationStatusBar}
    aria-controls={sectionId}
    ref={ref}
  >
    <div className="icon-container d-flex position-relative align-items-center">
      {children}
    </div>
  </button>
));

SidebarTriggerBase.propTypes = {
  onClick: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  isOpenNotificationStatusBar: PropTypes.bool.isRequired,
  sectionId: PropTypes.string.isRequired,
};

export default SidebarTriggerBase;

import PropTypes from 'prop-types';
import React from 'react';

const SidebarTriggerBase = ({
  onClick,
  ariaLabel,
  children,
}) => (
  <button
    className="border border-light-400 bg-transparent align-items-center align-content-center d-flex notification-btn"
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
  >
    <div className="icon-container d-flex position-relative align-items-center">
      {children}
    </div>
  </button>
);

SidebarTriggerBase.propTypes = {
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default SidebarTriggerBase;

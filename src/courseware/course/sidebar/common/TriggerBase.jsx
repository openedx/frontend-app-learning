import { injectIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import React from 'react';

function SidebarTriggerBase({
  onClick,
  ariaLabel,
  children,
}) {
  return (
    <button
      className="border border-light-400 bg-transparent align-items-center align-content-center d-flex"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <div className="icon-container d-flex position-relative align-items-center">
        {children}
      </div>
    </button>
  );
}

SidebarTriggerBase.propTypes = {
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default injectIntl(SidebarTriggerBase);

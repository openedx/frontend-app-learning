import PropTypes from 'prop-types';
import React from 'react';

import { useSidebar } from '../useSidebar';

// A sidebar widget's trigger: toggles the panel of the widget whose ID it is given.
const SidebarTriggerBase = ({
  sidebarId,
  ariaLabel,
  children,
}) => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      className="border border-light-400 bg-transparent align-items-center align-content-center d-flex sidebar-trigger-btn"
      type="button"
      onClick={() => toggleSidebar(sidebarId)}
      aria-label={ariaLabel}
    >
      <div className="icon-container d-flex position-relative align-items-center">
        {children}
      </div>
    </button>
  );
};

SidebarTriggerBase.propTypes = {
  sidebarId: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default SidebarTriggerBase;

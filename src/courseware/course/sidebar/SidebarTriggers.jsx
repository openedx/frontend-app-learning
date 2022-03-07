import classNames from 'classnames';
import React, { useContext } from 'react';
import SidebarContext from './SidebarContext';
import { SIDEBAR_ORDER, SIDEBARS } from './sidebars';

function SidebarTriggers() {
  const {
    toggleSidebar,
    currentSidebar,
  } = useContext(SidebarContext);
  return (
    <div className="d-flex ml-auto">
      {SIDEBAR_ORDER.map((sidebarId) => {
        const { Trigger } = SIDEBARS[sidebarId];
        const isActive = sidebarId === currentSidebar;
        return (
          <div
            className={classNames('mt-3', { 'border-primary-700': isActive })}
            style={{ borderBottom: isActive ? '2px solid' : null }}
            key={sidebarId}
          >
            <Trigger onClick={() => toggleSidebar(sidebarId)} key={sidebarId} />
          </div>
        );
      })}
    </div>
  );
}

SidebarTriggers.propTypes = {};

export default SidebarTriggers;

import classNames from 'classnames';
import React, { useContext } from 'react';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import SidebarContext from './SidebarContext';
import { SIDEBAR_ORDER, SIDEBARS } from './sidebars';

const SidebarTriggers = () => {
  const {
    toggleSidebar,
    currentSidebar,
  } = useContext(SidebarContext);

  const isMobileView = useWindowSize().width < breakpoints.small.minWidth;

  return (
    <div className="d-flex ml-auto">
      {SIDEBAR_ORDER.map((sidebarId) => {
        const { Trigger } = SIDEBARS[sidebarId];
        const isActive = sidebarId === currentSidebar;
        return (
          <div
            className={classNames({ 'mt-3 ml-1': !isMobileView, 'border-primary-700': isActive })}
            style={{ borderBottom: isActive ? '2px solid' : null }}
            key={sidebarId}
          >
            <Trigger onClick={() => toggleSidebar(sidebarId)} key={sidebarId} />
          </div>
        );
      })}
    </div>
  );
};

SidebarTriggers.propTypes = {};

export default SidebarTriggers;

import classNames from 'classnames';
import React, { useContext } from 'react';
import SidebarContext from './SidebarContext';
import SidebarTrigger from './SidebarTrigger';
import { SidebarID } from './constants';

const SidebarTriggers = () => {
  const {
    toggleSidebar,
    currentSidebar,
  } = useContext(SidebarContext);
  const isActive = currentSidebar === SidebarID;
  return (
    <div className="d-flex ml-auto">
      <div
        className={classNames('mt-3', { 'border-primary-700': isActive })}
        style={{ borderBottom: isActive ? '2px solid' : null }}
        key={SidebarID}
      >
        <SidebarTrigger onClick={() => toggleSidebar(SidebarID)} key={SidebarID} />
      </div>
    </div>
  );
};

SidebarTriggers.propTypes = {};

export default SidebarTriggers;

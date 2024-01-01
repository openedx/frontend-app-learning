import React, { useContext } from 'react';
import SidebarContext from './SidebarContext';
import SidebarTrigger from './SidebarTrigger';
import { SidebarID } from './constants';

const SidebarTriggers = () => {
  const { toggleSidebar } = useContext(SidebarContext);

  return (
    <div className="d-flex ml-auto" key={SidebarID}>
      <SidebarTrigger onClick={() => toggleSidebar(SidebarID)} key={SidebarID} />
    </div>
  );
};

export default SidebarTriggers;

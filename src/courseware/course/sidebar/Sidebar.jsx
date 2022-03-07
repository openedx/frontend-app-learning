import React, { useContext } from 'react';
import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

function Sidebar() {
  const {
    currentSidebar,
  } = useContext(SidebarContext);
  if (!currentSidebar) {
    return null;
  }
  const CurrentSidebar = SIDEBARS[currentSidebar].Sidebar;
  return (
    <CurrentSidebar />
  );
}

export default Sidebar;

import React, { useContext } from 'react';

import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const Sidebar = () => {
  const { currentSidebar } = useContext(SidebarContext);

  if (currentSidebar === null) { return null; }
  const SidebarToRender = SIDEBARS[currentSidebar].Sidebar;

  return (
    <SidebarToRender />
  );
};

export default Sidebar;

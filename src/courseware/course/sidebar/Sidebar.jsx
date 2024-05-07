import { useContext } from 'react';

import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const Sidebar = () => {
  const { currentSidebar } = useContext(SidebarContext);

  if (!currentSidebar || !SIDEBARS[currentSidebar]) {
    return null;
  }

  const SidebarToRender = SIDEBARS[currentSidebar].Sidebar;

  return (
    <SidebarToRender />
  );
};

export default Sidebar;

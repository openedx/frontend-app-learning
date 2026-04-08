import { useContext } from 'react';

import SidebarContext from './SidebarContext';

const Sidebar = () => {
  const { currentSidebar, SIDEBARS } = useContext(SidebarContext);

  if (!currentSidebar || !SIDEBARS || !SIDEBARS[currentSidebar]) {
    return null;
  }

  const SidebarToRender = SIDEBARS[currentSidebar].Sidebar;

  return (
    <SidebarToRender />
  );
};

export default Sidebar;

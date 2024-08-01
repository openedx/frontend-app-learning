import React, { useContext } from 'react';

import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const Sidebar = () => {
  const { currentSidebar, isDiscussionbarAvailable, isNotificationbarAvailable } = useContext(SidebarContext);

  if (currentSidebar === null || (!isDiscussionbarAvailable && !isNotificationbarAvailable)
    || !SIDEBARS[currentSidebar]) { return null; }
  const SidebarToRender = SIDEBARS[currentSidebar].Sidebar;

  return (
    <SidebarToRender />
  );
};

export default Sidebar;

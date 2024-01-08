import React, { useContext } from 'react';

import SidebarContext from './SidebarContext';
import { SIDEBAR_ORDER, SIDEBARS } from './sidebars';

const SidebarTriggers = () => {
  const { toggleSidebar } = useContext(SidebarContext);

  return (
    <div className="d-flex ml-auto">
      {SIDEBAR_ORDER.map((sidebarId) => {
        const { Trigger } = SIDEBARS[sidebarId];
        return (
          <Trigger onClick={() => toggleSidebar(sidebarId)} key={sidebarId} />
        );
      })}
    </div>
  );
};

export default SidebarTriggers;

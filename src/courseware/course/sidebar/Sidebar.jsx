import { useContext } from 'react';
import PropTypes from 'prop-types';

import SidebarContext from './SidebarContext';
import { SIDEBAR_ORDER, SIDEBARS } from './sidebars';

const Sidebar = ({ layout }) => {
  const { currentSidebar } = useContext(SidebarContext);

  if (!currentSidebar) {
    return null;
  }

  if (layout !== SIDEBARS[currentSidebar].LAYOUT) {
    return null;
  }

  return (
    <>
      {
        SIDEBAR_ORDER.map((sideBarId) => {
          const SidebarToRender = SIDEBARS[sideBarId].Sidebar;
          return <SidebarToRender key={sideBarId} />;
        })
      }
    </>
  );
};

Sidebar.propTypes = {
  layout: PropTypes.string.isRequired,
};

export default Sidebar;

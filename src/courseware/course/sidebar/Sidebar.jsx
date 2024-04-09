import { useContext } from 'react';
import PropTypes from 'prop-types';

import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const Sidebar = ({ layout }) => {
  const { currentSidebar } = useContext(SidebarContext);

  if (!currentSidebar) {
    return null;
  }

  if (layout !== SIDEBARS[currentSidebar]?.LAYOUT) {
    return null;
  }

  const SidebarToRender = SIDEBARS[currentSidebar].Sidebar;

  return (
    <SidebarToRender />
  );
};

Sidebar.propTypes = {
  layout: PropTypes.string.isRequired,
};

export default Sidebar;

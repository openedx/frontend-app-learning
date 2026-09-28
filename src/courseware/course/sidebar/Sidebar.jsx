import { useSidebar } from './SidebarContext';

const Sidebar = () => {
  const { currentSidebar, SIDEBARS } = useSidebar();

  if (!currentSidebar || !SIDEBARS[currentSidebar]) {
    return null;
  }

  const SidebarToRender = SIDEBARS[currentSidebar].Sidebar;

  return (
    <SidebarToRender />
  );
};

export default Sidebar;

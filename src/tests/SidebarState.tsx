import { useSidebar } from '@src/courseware/course/sidebar/SidebarContext';

// Renders the sidebar the provider currently has open, for suites that assert on it.
const SidebarState = () => {
  const { currentSidebar } = useSidebar();
  return <span data-testid="current-sidebar">{currentSidebar ?? 'null'}</span>;
};

export default SidebarState;

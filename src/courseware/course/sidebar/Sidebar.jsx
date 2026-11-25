import { useWidgets } from '@openedx/frontend-base';

import { useSidebar } from './useSidebar';

// The auxiliary sidebar slot's layout: the panel of the sidebar widget that is open, and nothing else.
const Sidebar = () => {
  const widgets = useWidgets();
  const { currentSidebar } = useSidebar();

  if (!currentSidebar) {
    return null;
  }

  return widgets.byId(currentSidebar);
};

export default Sidebar;

import classNames from 'classnames';
import { useWidgets } from '@openedx/frontend-base';
import { breakpoints, useWindowSize } from '@openedx/paragon';

import { useSidebar } from './useSidebar';

// The auxiliary sidebar trigger slot's layout: the trigger of each available sidebar widget, in the order of the panels,
// marked while its panel is open. A trigger whose panel is gone is not a sidebar widget, so it does not render.
const SidebarTriggers = () => {
  const widgets = useWidgets();
  const { currentSidebar, availableSidebarIds } = useSidebar();

  const { width } = useWindowSize();
  const isMobileView = width < breakpoints.small.minWidth;

  const triggers = availableSidebarIds
    .map(sidebarId => ({ sidebarId, nodes: widgets.byId(sidebarId) }))
    .filter(({ nodes }) => nodes.length > 0);

  if (triggers.length === 0) {
    return null;
  }

  return (
    <div className="d-flex ml-auto">
      {triggers.map(({ sidebarId, nodes }) => {
        const isActive = sidebarId === currentSidebar;
        return (
          <div
            className={classNames({ 'ml-1': !isMobileView, 'border-primary-700 sidebar-active': isActive })}
            style={{ borderBottom: '2px solid', borderColor: isActive ? 'inherit' : 'transparent' }}
            key={sidebarId}
          >
            {nodes}
          </div>
        );
      })}
    </div>
  );
};

export default SidebarTriggers;

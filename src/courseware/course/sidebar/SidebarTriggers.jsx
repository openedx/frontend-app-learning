import { useContext } from 'react';
import classNames from 'classnames';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import SidebarContext from './SidebarContext';

const SidebarTriggers = () => {
  const {
    toggleSidebar,
    currentSidebar,
    SIDEBAR_ORDER,
    SIDEBARS,
  } = useContext(SidebarContext);

  const { width } = useWindowSize();
  const isMobileView = width < breakpoints.small.minWidth;

  if (!SIDEBAR_ORDER || SIDEBAR_ORDER.length === 0) {
    return null;
  }

  return (
    <div className="d-flex ml-auto">
      {SIDEBAR_ORDER.map((sidebarId) => {
        const { Trigger } = SIDEBARS[sidebarId];
        const isActive = sidebarId === currentSidebar;
        return (
          <div
            className={classNames({ 'ml-1': !isMobileView, 'border-primary-700 sidebar-active': isActive })}
            style={{ borderBottom: '2px solid', borderColor: isActive ? 'inherit' : 'transparent' }}
            key={sidebarId}
          >
            <Trigger onClick={() => toggleSidebar(sidebarId)} />
          </div>
        );
      })}
    </div>
  );
};

export default SidebarTriggers;

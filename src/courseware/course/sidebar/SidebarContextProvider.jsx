import { breakpoints, useWindowSize } from '@edx/paragon';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';
import { getSessionStorage } from '../../../data/sessionStorage';
import { useModel } from '../../../generic/model-store';
import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

export default function SidebarProvider({
  courseId,
  unitId,
  children,
}) {
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const shouldDisplayFullScreen = useWindowSize().width < breakpoints.large.minWidth;
  const shouldDisplaySidebarOpen = useWindowSize().width > breakpoints.medium.minWidth;
  const showNotificationsOnLoad = getSessionStorage(`notificationTrayStatus.${courseId}`) !== 'closed';
  const initialSidebar = (verifiedMode && shouldDisplaySidebarOpen && showNotificationsOnLoad)
    ? SIDEBARS.NOTIFICATIONS.ID
    : null;
  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);
  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(getLocalStorage(`upgradeNotificationCurrentState.${courseId}`));

  useEffect(() => {
    // As a one-off set initial sidebar if the verified mode data has just loaded
    if (verifiedMode && currentSidebar === null && initialSidebar) {
      setCurrentSidebar(initialSidebar);
    }
  }, [initialSidebar, verifiedMode]);

  const onNotificationSeen = () => {
    setNotificationStatus('inactive');
    setLocalStorage(`notificationStatus.${courseId}`, 'inactive');
  };

  const toggleSidebar = (sidebarId) => {
    // Switch to new sidebar or hide the current sidebar
    setCurrentSidebar(sidebarId === currentSidebar ? null : sidebarId);
  };

  return (
    <SidebarContext.Provider value={{
      toggleSidebar,
      onNotificationSeen,
      setNotificationStatus,
      currentSidebar,
      notificationStatus,
      upgradeNotificationCurrentState,
      setUpgradeNotificationCurrentState,
      shouldDisplaySidebarOpen,
      shouldDisplayFullScreen,
      courseId,
      unitId,
    }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

SidebarProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

SidebarProvider.defaultProps = {
  children: null,
};

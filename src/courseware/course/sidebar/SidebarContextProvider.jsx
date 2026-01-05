import { breakpoints, useWindowSize } from '@openedx/paragon';
import PropTypes from 'prop-types';
import {
  useEffect, useState, useMemo, useCallback,
} from 'react';

import { useModel } from '@src/generic/model-store';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { getSessionStorage } from '@src/data/sessionStorage';

import * as discussionsSidebar from './sidebars/discussions';
import * as notificationsSidebar from './sidebars/notifications';
import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const SidebarProvider = ({
  courseId,
  unitId,
  children,
}) => {
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const topic = useModel('discussionTopics', unitId);
  const isUnitHasDiscussionTopics = topic?.id && topic?.enabledInContext;
  const shouldDisplayFullScreen = useWindowSize().width < breakpoints.extraLarge.minWidth;
  const shouldDisplaySidebarOpen = useWindowSize().width > breakpoints.extraLarge.minWidth;
  const query = new URLSearchParams(window.location.search);
  const isInitiallySidebarOpen = shouldDisplaySidebarOpen || query.get('sidebar') === 'true';

  const isNotificationTrayOpen = getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open';

  let initialSidebar;
  if (isNotificationTrayOpen) {
    initialSidebar = SIDEBARS[notificationsSidebar.ID].ID;
  } else {
    initialSidebar = shouldDisplayFullScreen ? getLocalStorage(`sidebar.${courseId}`) : null;
    if (!shouldDisplayFullScreen && isInitiallySidebarOpen) {
      initialSidebar = isUnitHasDiscussionTopics
        ? SIDEBARS[discussionsSidebar.ID].ID
        : verifiedMode && SIDEBARS[notificationsSidebar.ID].ID;
    }
  }

  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);
  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(getLocalStorage(`upgradeNotificationCurrentState.${courseId}`));

  useEffect(() => {
    if (initialSidebar && currentSidebar !== initialSidebar) {
      setCurrentSidebar(initialSidebar);
    }
  }, [unitId, topic]);

  useEffect(() => {
    if (initialSidebar) {
      setCurrentSidebar(initialSidebar);
    }
  }, [shouldDisplaySidebarOpen]);

  const onNotificationSeen = useCallback(() => {
    setNotificationStatus('inactive');
    setLocalStorage(`notificationStatus.${courseId}`, 'inactive');
  }, [courseId]);

  const toggleSidebar = useCallback((sidebarId) => {
    // Switch to new sidebar or hide the current sidebar
    const newSidebar = sidebarId === currentSidebar ? null : sidebarId;
    setCurrentSidebar(newSidebar);
    setLocalStorage(`sidebar.${courseId}`, newSidebar);
  }, [currentSidebar]);

  const contextValue = useMemo(() => ({
    initialSidebar,
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
  }), [courseId, currentSidebar, notificationStatus, onNotificationSeen, shouldDisplayFullScreen,
    shouldDisplaySidebarOpen, toggleSidebar, unitId, upgradeNotificationCurrentState]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

SidebarProvider.defaultProps = {
  children: null,
};

export default SidebarProvider;

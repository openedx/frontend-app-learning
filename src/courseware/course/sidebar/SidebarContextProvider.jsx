import { breakpoints, useWindowSize } from '@openedx/paragon';
import PropTypes from 'prop-types';
import React, {
  useEffect, useState, useMemo, useCallback,
} from 'react';

import { useModel } from '../../../generic/model-store';
import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';

import * as courseOutlineSidebar from './sidebars/course-outline';
import * as discussionsSidebar from './sidebars/discussions';
import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const SidebarProvider = ({
  courseId,
  unitId,
  children,
}) => {
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const shouldDisplayFullScreen = useWindowSize().width < breakpoints.extraLarge.minWidth;
  const shouldDisplaySidebarOpen = useWindowSize().width > breakpoints.extraLarge.minWidth;
  const hasSavedCourseOutlineSidebarState = window.sessionStorage.getItem('showCourseOutlineSidebar');
  const query = new URLSearchParams(window.location.search);
  const isInitiallySidebarOpen = shouldDisplaySidebarOpen || query.get('sidebar') === 'true';
  const defaultSidebarID = hasSavedCourseOutlineSidebarState
    ? SIDEBARS[courseOutlineSidebar.ID].ID
    : SIDEBARS[discussionsSidebar.ID].ID;
  const initialSidebar = isInitiallySidebarOpen ? defaultSidebarID : null;
  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);
  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(getLocalStorage(`upgradeNotificationCurrentState.${courseId}`));

  useEffect(() => {
    // if the user hasn't purchased the course, show the notifications sidebar
    if (currentSidebar === null) {
      setCurrentSidebar(verifiedMode ? SIDEBARS.NOTIFICATIONS.ID : SIDEBARS.DISCUSSIONS.ID);
    }
  }, [unitId]);

  useEffect(() => {
    setCurrentSidebar(initialSidebar);
  }, [shouldDisplaySidebarOpen]);

  const onNotificationSeen = useCallback(() => {
    setNotificationStatus('inactive');
    setLocalStorage(`notificationStatus.${courseId}`, 'inactive');
  }, [courseId]);

  const toggleSidebar = useCallback((sidebarId) => {
    // Switch to new sidebar or hide the current sidebar
    setCurrentSidebar(sidebarId === currentSidebar ? null : sidebarId);
  }, [currentSidebar]);

  const contextValue = useMemo(() => ({
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

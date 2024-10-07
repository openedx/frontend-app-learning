import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import isEmpty from 'lodash/isEmpty';

import { breakpoints, useWindowSize } from '@openedx/paragon';

import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';
import { useModel } from '../../../generic/model-store';
import { WIDGETS } from '../../../constants';
import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

interface Props {
  courseId: string;
  unitId: string;
  children?: React.ReactNode;
}

const SidebarProvider: React.FC<Props> = ({
  courseId,
  unitId,
  children,
}) => {
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const topic = useModel('discussionTopics', unitId);
  const shouldDisplayFullScreen = useWindowSize().width < breakpoints.large.minWidth;
  const shouldDisplaySidebarOpen = useWindowSize().width > breakpoints.medium.minWidth;
  const query = new URLSearchParams(window.location.search);
  const isInitiallySidebarOpen = shouldDisplaySidebarOpen || query.get('sidebar') === 'true';
  const sidebarKey = `sidebar.${courseId}`;

  let initialSidebar = shouldDisplayFullScreen && sidebarKey in localStorage ? getLocalStorage(sidebarKey)
    : SIDEBARS.DISCUSSIONS_NOTIFICATIONS.ID;

  if (!shouldDisplayFullScreen && isInitiallySidebarOpen) {
    initialSidebar = SIDEBARS.DISCUSSIONS_NOTIFICATIONS.ID;
  }
  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);
  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [hideDiscussionbar, setHideDiscussionbar] = useState(false);
  const [hideNotificationbar, setHideNotificationbar] = useState(false);
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(
    getLocalStorage(`upgradeNotificationCurrentState.${courseId}`),
  );
  const isDiscussionbarAvailable = (topic?.id && topic?.enabledInContext) || false;
  const isNotificationbarAvailable = !isEmpty(verifiedMode);

  const onNotificationSeen = useCallback(() => {
    setNotificationStatus('inactive');
    setLocalStorage(`notificationStatus.${courseId}`, 'inactive');
  }, [courseId]);

  useEffect(() => {
    setHideDiscussionbar(!isDiscussionbarAvailable);
    setHideNotificationbar(!isNotificationbarAvailable);
    if (initialSidebar && currentSidebar !== initialSidebar) {
      setCurrentSidebar(SIDEBARS.DISCUSSIONS_NOTIFICATIONS.ID);
    }
  }, [unitId, topic]);

  useEffect(() => {
    if (hideDiscussionbar && hideNotificationbar) {
      setCurrentSidebar(null);
    }
  }, [hideDiscussionbar, hideNotificationbar]);

  useEffect(() => {
    setCurrentSidebar(initialSidebar);
  }, [shouldDisplaySidebarOpen, initialSidebar]);

  const handleWidgetToggle = useCallback((widgetId, sidebarId) => {
    setHideDiscussionbar(prevWidgetId => (widgetId === WIDGETS.DISCUSSIONS ? true : prevWidgetId));
    setHideNotificationbar(prevWidgetId => (widgetId === WIDGETS.NOTIFICATIONS ? true : prevWidgetId));
    setLocalStorage(sidebarKey, sidebarId);
  }, []);

  const handleSidebarToggle = useCallback((sidebarId) => {
    setCurrentSidebar(prevSidebar => (sidebarId === prevSidebar ? null : sidebarId));
    setHideDiscussionbar(!isDiscussionbarAvailable);
    setHideNotificationbar(!isNotificationbarAvailable);
    setLocalStorage(sidebarKey, sidebarId === currentSidebar ? null : sidebarId);
  }, [currentSidebar, isDiscussionbarAvailable, isNotificationbarAvailable]);

  const clearSidebarKeyIfWidgetsUnavailable = useCallback((widgetId) => {
    if (((!isNotificationbarAvailable || hideNotificationbar) && widgetId === WIDGETS.DISCUSSIONS)
      || ((!isDiscussionbarAvailable || hideDiscussionbar) && widgetId === WIDGETS.NOTIFICATIONS)) {
      setLocalStorage(sidebarKey, null);
    }
  }, [isDiscussionbarAvailable, isNotificationbarAvailable, hideDiscussionbar, hideNotificationbar]);

  const toggleSidebar = useCallback((sidebarId = null, widgetId = null) => {
    if (widgetId) {
      handleWidgetToggle(widgetId, sidebarId);
    } else {
      handleSidebarToggle(sidebarId);
    }

    clearSidebarKeyIfWidgetsUnavailable(widgetId);
  }, [handleWidgetToggle, handleSidebarToggle, clearSidebarKeyIfWidgetsUnavailable]);

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
    hideDiscussionbar,
    hideNotificationbar,
    isNotificationbarAvailable,
    isDiscussionbarAvailable,
  }), [courseId, currentSidebar, notificationStatus, onNotificationSeen, shouldDisplayFullScreen,
    shouldDisplaySidebarOpen, toggleSidebar, unitId, upgradeNotificationCurrentState, hideDiscussionbar,
    hideNotificationbar, isNotificationbarAvailable, isDiscussionbarAvailable]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;

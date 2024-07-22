import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';

import isEmpty from 'lodash/isEmpty';

import { breakpoints, useWindowSize } from '@openedx/paragon';

import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';
import { useModel } from '../../../generic/model-store';
import { WIDGETS } from '../../../constants';
import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const SidebarProvider = ({
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
  const keyExists = sidebarKey in localStorage;

  let initialSidebar = shouldDisplayFullScreen && keyExists ? getLocalStorage(`sidebar.${courseId}`) : SIDEBARS.DISCUSSIONS_NOTIFICATIONS.ID;

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

  const toggleSidebar = useCallback((sidebarId = null, widgetId = null) => {
    if (widgetId) {
      setHideDiscussionbar(prevWidgetId => (widgetId === WIDGETS.DISCUSSIONS ? true : prevWidgetId));
      setHideNotificationbar(prevWidgetId => (widgetId === WIDGETS.NOTIFICATIONS ? true : prevWidgetId));
      setLocalStorage(`sidebar.${courseId}`, sidebarId);
    } else {
      setCurrentSidebar(prevSidebar => (sidebarId === prevSidebar ? null : sidebarId));
      setHideDiscussionbar(!isDiscussionbarAvailable);
      setHideNotificationbar(!isNotificationbarAvailable);
      setLocalStorage(`sidebar.${courseId}`, sidebarId === currentSidebar ? null : sidebarId);
    }
    if ((!isNotificationbarAvailable && widgetId === WIDGETS.DISCUSSIONS)
      || (!isDiscussionbarAvailable && widgetId === WIDGETS.NOTIFICATIONS)) {
      setLocalStorage(`sidebar.${courseId}`, null);
    }
  }, [isDiscussionbarAvailable, isNotificationbarAvailable, currentSidebar]);

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

SidebarProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

SidebarProvider.defaultProps = {
  children: null,
};

export default SidebarProvider;

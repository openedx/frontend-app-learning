import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';

import isEmpty from 'lodash/isEmpty';

import { breakpoints, useWindowSize } from '@edx/paragon';

import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';
import { useModel } from '../../../generic/model-store';
import WIDGETS from './constants';
import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const SidebarProvider = ({
  courseId,
  unitId,
  children,
}) => {
  const shouldDisplayFullScreen = useWindowSize().width < breakpoints.large.minWidth;
  const shouldDisplaySidebarOpen = useWindowSize().width > breakpoints.medium.minWidth;
  const query = new URLSearchParams(window.location.search);
  const initialSidebar = (shouldDisplaySidebarOpen || query.get('sidebar') === 'true')
    ? SIDEBARS.DISCUSSIONS_NOTIFICATIONS.ID : null;
  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);
  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [hideDiscussionbar, setHideDiscussionbar] = useState(false);
  const [hideNotificationbar, setHideNotificationbar] = useState(false);
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(
    getLocalStorage(`upgradeNotificationCurrentState.${courseId}`),
  );
  const topic = useModel('discussionTopics', unitId);
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const isDiscussionbarAvailable = topic?.id && topic?.enabledInContext;
  const isNotificationbarAvailable = !isEmpty(verifiedMode);

  useEffect(() => {
    setHideDiscussionbar(!isDiscussionbarAvailable);
    setHideNotificationbar(!isNotificationbarAvailable);
    setCurrentSidebar(SIDEBARS.DISCUSSIONS_NOTIFICATIONS.ID);
  }, [unitId, topic]);

  const onNotificationSeen = useCallback(() => {
    setNotificationStatus('inactive');
    setLocalStorage(`notificationStatus.${courseId}`, 'inactive');
  }, [courseId]);

  useEffect(() => {
    if (hideDiscussionbar && hideNotificationbar) {
      setCurrentSidebar(null);
    }
  }, [hideDiscussionbar, hideNotificationbar]);

  const toggleSidebar = useCallback((sidebarId = null, widgetId = null) => {
    if (widgetId) {
      setHideDiscussionbar(prevWidgetId => (widgetId === WIDGETS.DISCUSSIONS ? true : prevWidgetId));
      setHideNotificationbar(prevWidgetId => (widgetId === WIDGETS.NOTIFICATIONS ? true : prevWidgetId));
    } else {
      setCurrentSidebar(prevSidebar => (sidebarId === prevSidebar ? null : sidebarId));
      setHideDiscussionbar(!isDiscussionbarAvailable);
      setHideNotificationbar(!isNotificationbarAvailable);
    }
  }, [isDiscussionbarAvailable, isNotificationbarAvailable]);

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

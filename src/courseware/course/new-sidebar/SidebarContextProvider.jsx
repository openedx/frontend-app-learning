import { breakpoints, useWindowSize } from '@edx/paragon';
import PropTypes from 'prop-types';
import React, {
  useEffect, useState, useMemo, useCallback,
} from 'react';
import isEmpty from 'lodash/isEmpty';
import { SIDEBARS } from './sidebars';
import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';
import SidebarContext from './SidebarContext';
import { useModel } from '../../../generic/model-store';

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
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(
    getLocalStorage(`upgradeNotificationCurrentState.${courseId}`),
  );
  const topic = useModel('discussionTopics', unitId);
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const isDiscussionbarAvailable = !topic?.id || !topic?.enabledInContext;
  const isNotificationbarAvailable = !isEmpty(verifiedMode);
  const [hideDiscussionbar, setHideDiscussionbar] = useState(isDiscussionbarAvailable);
  const [hideNotificationbar, setHideNotificationbar] = useState(isNotificationbarAvailable);

  useEffect(() => {
    setCurrentSidebar(SIDEBARS.DISCUSSIONS_NOTIFICATIONS.ID);
  }, [unitId]);

  const onNotificationSeen = useCallback(() => {
    setNotificationStatus('inactive');
    setLocalStorage(`notificationStatus.${courseId}`, 'inactive');
  }, [courseId]);

  useEffect(() => {
    if (hideDiscussionbar && hideNotificationbar) {
      setCurrentSidebar(null);
    }
  }, [hideDiscussionbar, hideNotificationbar]);

  const toggleSidebar = useCallback((sidebarId, tabId) => {
    if (tabId === Discussions) {
      setHideDiscussionbar(true);
    } else if (tabId === Notifications) {
      setHideNotificationbar(true);
    } else {
      setCurrentSidebar(prevSidebar => (sidebarId === prevSidebar ? null : sidebarId));
      if (isDiscussionbarAvailable) { setHideDiscussionbar(false); }
      if (isNotificationbarAvailable) { setHideNotificationbar(false); }
    }
  }, [isNotificationbarAvailable, isDiscussionbarAvailable]);

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

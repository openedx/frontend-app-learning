import { breakpoints, useWindowSize } from '@edx/paragon';
import PropTypes from 'prop-types';
import React, {
  useEffect, useState, useMemo, useCallback,
} from 'react';
import isEmpty from 'lodash/isEmpty';
import { SidebarID, Notifications, Discussions } from './constants';
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
  const initialSidebar = (shouldDisplaySidebarOpen || query.get('sidebar') === 'true') ? SidebarID : null;
  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);
  const [hideDiscussionbar, setHideDiscussionbar] = useState(false);
  const [isDiscussionbarAvailable, setIsDiscussionbarAvailable] = useState(true);
  const [hideNotificationbar, setHideNotificationbar] = useState(false);
  const [isNotificationbarAvailable, setIsNotificationbarAvailable] = useState(true);

  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(getLocalStorage(`upgradeNotificationCurrentState.${courseId}`));
  const topic = useModel('discussionTopics', unitId);
  const { verifiedMode } = useModel('courseHomeMeta', courseId);

  useEffect(() => {
    if (!topic?.id || !topic?.enabledInContext) {
      setIsDiscussionbarAvailable(false);
      setHideDiscussionbar(true);
    } else {
      setIsDiscussionbarAvailable(true);
      setHideDiscussionbar(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  useEffect(() => {
    if (isEmpty(verifiedMode)) {
      setIsNotificationbarAvailable(false);
      setHideNotificationbar(true);
    } else {
      setIsNotificationbarAvailable(true);
      setHideNotificationbar(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedMode]);

  useEffect(() => {
    setCurrentSidebar(SidebarID);
    if (isDiscussionbarAvailable) { setHideDiscussionbar(false); } else { setHideDiscussionbar(true); }
    if (isNotificationbarAvailable) { setHideNotificationbar(false); } else { setHideNotificationbar(true); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId, isDiscussionbarAvailable, isNotificationbarAvailable]);

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

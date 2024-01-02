import { breakpoints, useWindowSize } from '@edx/paragon';
import PropTypes from 'prop-types';
import React, {
  useEffect, useState, useMemo, useCallback,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import isEmpty from 'lodash/isEmpty';
import { SIDEBARS } from './sidebars';
import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';
import SidebarContext from './SidebarContext';
import { useModel } from '../../../generic/model-store';
import messages from './messages';

const SidebarProvider = ({
  courseId,
  unitId,
  children,
}) => {
  const intl = useIntl();
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

  const toggleSidebar = useCallback((sidebarId, widgetId) => {
    if (widgetId) {
      if (widgetId === intl.formatMessage(messages.discussionsTitle)) {
        setHideDiscussionbar(true);
      } else if (widgetId === intl.formatMessage(messages.notificationTitle)) {
        setHideNotificationbar(true);
      }
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

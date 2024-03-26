import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';

import { getLocalStorage, setLocalStorage } from '../../../../../data/localStorage';
import { getSessionStorage, setSessionStorage } from '../../../../../data/sessionStorage';
import { useModel } from '../../../../../generic/model-store';
import { getCourseDiscussionTopics } from '../../../../data/thunks';
import { RightSidebarFilled, RightSidebarOutlined } from '../../icons';
import messages from '../../messages';
import SidebarContext from '../../SidebarContext';

export const ID = 'DISCUSSIONS_NOTIFICATIONS';

const DiscussionsNotificationsTrigger = ({ onClick }) => {
  const {
    courseId,
    currentSidebar,
    setNotificationStatus,
    upgradeNotificationCurrentState,
    isNotificationbarAvailable,
    isDiscussionbarAvailable,
  } = useContext(SidebarContext);

  const dispatch = useDispatch();
  const intl = useIntl();
  const { tabs } = useModel('courseHomeMeta', courseId);
  const baseUrl = getConfig().DISCUSSIONS_MFE_BASE_URL;
  const edxProvider = useMemo(
    () => tabs?.find(tab => tab.slug === 'discussion'),
    [tabs],
  );

  useEffect(() => {
    if (baseUrl && edxProvider) {
      dispatch(getCourseDiscussionTopics(courseId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, baseUrl, edxProvider]);

  /* Re-show a red dot beside the notification trigger for each of the 7 UpgradeNotification stages
   The upgradeNotificationCurrentState prop will be available after UpgradeNotification mounts. Once available,
  compare with the last state they've seen, and if it's different then set dot back to red */
  function updateUpgradeNotificationLastSeen() {
    if (upgradeNotificationCurrentState) {
      if (getLocalStorage(`upgradeNotificationLastSeen.${courseId}`) !== upgradeNotificationCurrentState) {
        setNotificationStatus('active');
        setLocalStorage(`notificationStatus.${courseId}`, 'active');
        setLocalStorage(`upgradeNotificationLastSeen.${courseId}`, upgradeNotificationCurrentState);
      }
    }
  }

  if (!getLocalStorage(`notificationStatus.${courseId}`)) {
    setLocalStorage(`notificationStatus.${courseId}`, 'active'); // Show red dot on notificationTrigger until seen
  }

  if (!getLocalStorage(`upgradeNotificationCurrentState.${courseId}`)) {
    setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'initialize');
  }

  useEffect(() => {
    updateUpgradeNotificationLastSeen();
  });

  const handleClick = () => {
    if (getSessionStorage(`notificationTrayStatus.${courseId}`) === 'open') {
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'closed');
    } else {
      setSessionStorage(`notificationTrayStatus.${courseId}`, 'open');
    }
    onClick();
  };

  if (!isDiscussionbarAvailable && !isNotificationbarAvailable) { return null; }

  return (
    <IconButton
      src={currentSidebar ? RightSidebarFilled : RightSidebarOutlined}
      iconAs={Icon}
      onClick={handleClick}
      alt={intl.formatMessage(messages.openSidebarTrigger)}
      className="icon-hover"
    />
  );
};

DiscussionsNotificationsTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default DiscussionsNotificationsTrigger;

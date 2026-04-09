import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getCourseDiscussionTopics } from '@src/courseware/data/thunks';
import DiscussionsSidebar from './DiscussionsSidebar';
import DiscussionsTrigger, { ID } from './DiscussionsTrigger';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);

export const discussionsIsAvailable = ({ course }) => {
  const baseUrl = getConfig().DISCUSSIONS_MFE_BASE_URL;
  const hasDiscussionTab = course?.tabs?.some(tab => tab.slug === 'discussion');

  return !!(baseUrl && hasDiscussionTab);
};

export const discussionsPrefetch = ({ courseId, course, dispatch }) => {
  const baseUrl = getConfig().DISCUSSIONS_MFE_BASE_URL;
  const discussionTab = course?.tabs?.find(tab => tab.slug === 'discussion');
  if (baseUrl && discussionTab) {
    dispatch(getCourseDiscussionTopics(courseId));
  }
};

export const discussionsWidgetConfig = {
  id: ID,
  priority: 10,
  Sidebar: DiscussionsSidebar,
  Trigger: DiscussionsTrigger,
  isAvailable: discussionsIsAvailable,
  prefetch: discussionsPrefetch,
  enabled: true,
};

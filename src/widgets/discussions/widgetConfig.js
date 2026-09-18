import { getConfig } from '@edx/frontend-platform';
import { prefetchDiscussionTopics } from '@src/courseware/data/apiHooks';
import DiscussionsSidebar from './DiscussionsSidebar';
import DiscussionsTrigger, { ID } from './DiscussionsTrigger';

export const discussionsIsAvailable = ({ unit }) => !!(unit?.id && unit?.enabledInContext);

export const discussionsPrefetch = ({ courseId, course, queryClient }) => {
  const baseUrl = getConfig().DISCUSSIONS_MFE_BASE_URL;
  const edxProvider = course?.tabs?.find(tab => tab.slug === 'discussion');

  if (baseUrl && edxProvider) {
    prefetchDiscussionTopics(queryClient, courseId);
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

import { getConfig } from '@edx/frontend-platform';
import { hasDiscussionTab } from '@src/course-tabs/utils';
import { prefetchDiscussionTopics } from '@src/courseware/data/apiHooks';
import DiscussionsSidebar from './DiscussionsSidebar';
import DiscussionsTrigger, { ID } from './DiscussionsTrigger';

export const discussionsIsAvailable = ({ unit }) => !!(unit?.id && unit?.enabledInContext);

export const discussionsPrefetch = ({ courseId, course, queryClient }) => {
  if (getConfig().DISCUSSIONS_MFE_BASE_URL && hasDiscussionTab(course?.tabs)) {
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

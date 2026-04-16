import DiscussionsSidebar from './DiscussionsSidebar';
import DiscussionsTrigger, { ID } from './DiscussionsTrigger';

export const discussionsIsAvailable = ({ unit }) => !!(unit?.id && unit?.enabledInContext);

export const discussionsWidgetConfig = {
  id: ID,
  priority: 10,
  Sidebar: DiscussionsSidebar,
  Trigger: DiscussionsTrigger,
  isAvailable: discussionsIsAvailable,
  enabled: true,
};

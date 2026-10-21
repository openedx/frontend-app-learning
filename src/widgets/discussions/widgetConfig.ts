import type { SidebarWidget } from '@src/courseware/course/sidebar/SidebarContext';
import DiscussionsProvider from './DiscussionsProvider';
import DiscussionsSidebar from './DiscussionsSidebar';
import DiscussionsTrigger, { ID } from './DiscussionsTrigger';

export const discussionsIsAvailable: NonNullable<SidebarWidget['isAvailable']> = ({ unit }) => (
  !!(unit?.id && unit?.enabledInContext)
);

export const discussionsWidgetConfig: SidebarWidget = {
  id: ID,
  priority: 10,
  Sidebar: DiscussionsSidebar,
  Trigger: DiscussionsTrigger,
  Provider: DiscussionsProvider,
  isAvailable: discussionsIsAvailable,
  enabled: true,
};

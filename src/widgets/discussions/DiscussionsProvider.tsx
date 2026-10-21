import type { ReactNode } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useQuery } from '@tanstack/react-query';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { hasDiscussionTab } from '@src/course-tabs/utils';
import { useSidebar } from '@src/courseware/course/sidebar/SidebarContext';
import { discussionTopicsQuery } from '@src/courseware/data/apiHooks';

const DiscussionsProvider = ({ children }: { children: ReactNode }) => {
  const { courseId } = useSidebar();
  const tabs = useCourseHomeMeta(courseId, { enabled: false }).data?.tabs;
  useQuery({
    ...discussionTopicsQuery(courseId),
    enabled: !!getConfig().DISCUSSIONS_MFE_BASE_URL && hasDiscussionTab(tabs),
  });
  return <>{children}</>;
};

export default DiscussionsProvider;

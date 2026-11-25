import { useQuery } from '@tanstack/react-query';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { hasDiscussionTab } from '@src/course-tabs/utils';
import { useSidebar } from '@src/courseware/course/sidebar/useSidebar';
import { discussionTopicsQuery } from '@src/courseware/data/apiHooks';

// Loads the course's discussion topics once the course metadata says it has a discussion tab. Renders nothing.
const DiscussionsTopicsLoader = () => {
  const { courseId } = useSidebar();
  const tabs = useCourseHomeMeta(courseId, { enabled: false }).data?.tabs;
  useQuery({
    ...discussionTopicsQuery(courseId),
    enabled: hasDiscussionTab(tabs),
  });
  return null;
};

export default DiscussionsTopicsLoader;

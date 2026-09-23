import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata, useCoursewareOutline } from '@src/courseware/data/apiHooks';

// Mounts the course-level query hooks CoursewareContainer mounts (courseware metadata, outline and
// course-home metadata), for components under test that only read them.
const MountCourseQueryHooks = ({ courseId }: { courseId: string }) => {
  useCoursewareMetadata(courseId);
  useCoursewareOutline(courseId);
  useCourseHomeMeta(courseId);
  return null;
};

export default MountCourseQueryHooks;

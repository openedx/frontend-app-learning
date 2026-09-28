import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata, useCoursewareOutline, useSequenceMetadata } from '@src/courseware/data/apiHooks';

// Mounts the query hooks CoursewareContainer mounts (courseware metadata, outline, course-home
// metadata and, when given a sequenceId, the sequence metadata), for components under test that
// only read them.
const MountCourseQueryHooks = ({ courseId, sequenceId }: { courseId: string, sequenceId?: string }) => {
  useCoursewareMetadata(courseId);
  useCoursewareOutline(courseId);
  useCourseHomeMeta(courseId);
  useSequenceMetadata(sequenceId);
  return null;
};

export default MountCourseQueryHooks;

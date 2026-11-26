import { useParams } from 'react-router-dom';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';

// The shell header renders outside the matched route's element, but the shell's layout route is the
// root of the route tree, so useParams() still returns the course ID of the page below it.
const CourseInfo = () => {
  const { courseId } = useParams();
  // A reader of the metadata the tab page frame loads: it never fetches.
  const { data } = useCourseHomeMeta(courseId, { enabled: false });

  if (!data) {
    return null;
  }

  const { org, number, title } = data;

  return (
    <div style={{ minWidth: 0, lineHeight: 1 }}>
      <span className="d-block small m-0">{org} {number}</span>
      <span className="d-block m-0 font-weight-bold course-title">{title}</span>
    </div>
  );
};

export default CourseInfo;

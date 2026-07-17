import { CourseOutline } from './CourseOutline';
import { ID } from './constants';
import { useCourseOutlineSidebar } from './hooks';

const CourseOutlineTray = () => {
  const {
    currentSidebar,
  } = useCourseOutlineSidebar();

  if (currentSidebar !== ID) {
    return null;
  }
  return <CourseOutline />;
};

CourseOutlineTray.ID = ID;

export default CourseOutlineTray;

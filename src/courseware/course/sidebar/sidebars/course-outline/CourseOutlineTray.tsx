import { CourseOutline } from './CourseOutline';
import { ID } from './constants';
import { useCourseOutlineSidebar } from './hooks';

const CourseOutlineTray = () => {
  const {
    currentSidebar,
    shouldDisplayFullScreen,
    handleToggleCollapse,
  } = useCourseOutlineSidebar();

  if (currentSidebar !== ID) {
    return null;
  }
  return <CourseOutline fullscreen={shouldDisplayFullScreen} onToggleCollapse={handleToggleCollapse} />;
};

CourseOutlineTray.ID = ID;

export default CourseOutlineTray;

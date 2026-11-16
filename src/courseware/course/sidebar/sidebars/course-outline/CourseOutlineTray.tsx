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
  const handleUnitClick = () => {
    // Hide the sidebar after selecting a unit on a mobile device.
    if (shouldDisplayFullScreen) {
      handleToggleCollapse();
    }
  };
  return (
    <CourseOutline
      fullscreen={shouldDisplayFullScreen}
      onToggleCollapse={handleToggleCollapse}
      onUnitClick={handleUnitClick}
    />
  );
};

CourseOutlineTray.ID = ID;

export default CourseOutlineTray;

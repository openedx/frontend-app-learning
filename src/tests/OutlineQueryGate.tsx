import type { ReactNode } from 'react';

import { useCourseOutlineStructure, useCoursewareOutlineSidebarToggles } from '@src/courseware/data/apiHooks';
import { useCourseId } from '@src/generic/course-params';

// Renders children once the navigation sidebar's two queries (the outline and its toggles) have
// succeeded for the route's course, as the sidebar's rows expect when CourseOutline renders them.
const OutlineQueryGate = ({ children }: { children: ReactNode }) => {
  const courseId = useCourseId();
  const outline = useCourseOutlineStructure(courseId);
  const toggles = useCoursewareOutlineSidebarToggles(courseId);
  return outline.isSuccess && toggles.isSuccess ? children : null;
};

export default OutlineQueryGate;

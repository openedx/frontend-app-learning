import { Slot } from '@openedx/frontend-base';

import ViewCoursesButton from '@src/courseware/course/course-exit/ViewCoursesButton';

export const courseExitViewCoursesSlotId = 'org.openedx.frontend.slot.learning.courseExitViewCourses.v1';

export interface CourseExitViewCoursesSlotProps {
  courseId: string;
}

const CourseExitViewCoursesSlot = ({ courseId }: CourseExitViewCoursesSlotProps) => (
  <Slot id={courseExitViewCoursesSlotId} courseId={courseId}>
    <ViewCoursesButton />
  </Slot>
);

export default CourseExitViewCoursesSlot;

import { Slot } from '@openedx/frontend-base';

import CourseRecommendations from '@src/courseware/course/course-exit/CourseRecommendations';

export const courseRecommendationsSlotId = 'org.openedx.frontend.slot.learning.courseRecommendations.v1';

export interface CourseRecommendationsSlotProps {
  courseId: string;
  variant: string;
}

const CourseRecommendationsSlot = ({ courseId, variant }: CourseRecommendationsSlotProps) => (
  <Slot id={courseRecommendationsSlotId} courseId={courseId} variant={variant}>
    <CourseRecommendations variant={variant} />
  </Slot>
);

export default CourseRecommendationsSlot;

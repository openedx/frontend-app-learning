import { Slot } from '@openedx/frontend-base';

import DashboardFootnoteLink from '@src/courseware/course/course-exit/DashboardFootnoteLink';

export const courseExitDashboardFootnoteLinkSlotId = 'org.openedx.frontend.slot.learning.courseExitDashboardFootnoteLink.v1';

export interface CourseExitDashboardFootnoteLinkSlotProps {
  courseId: string;
  variant: string;
}

const CourseExitDashboardFootnoteLinkSlot = ({ courseId, variant }: CourseExitDashboardFootnoteLinkSlotProps) => (
  <Slot id={courseExitDashboardFootnoteLinkSlotId} courseId={courseId} variant={variant}>
    <DashboardFootnoteLink courseId={courseId} variant={variant} />
  </Slot>
);

export default CourseExitDashboardFootnoteLinkSlot;

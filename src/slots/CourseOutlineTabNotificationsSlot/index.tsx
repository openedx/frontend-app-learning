import { Slot } from '@openedx/frontend-base';

export const courseOutlineTabNotificationsSlotId = 'org.openedx.frontend.slot.learning.courseOutlineTabNotifications.v1';

export interface CourseOutlineTabNotificationsSlotProps {
  courseId: string;
}

const CourseOutlineTabNotificationsSlot = ({ courseId }: CourseOutlineTabNotificationsSlotProps) => (
  <Slot id={courseOutlineTabNotificationsSlotId} courseId={courseId} />
);

export default CourseOutlineTabNotificationsSlot;

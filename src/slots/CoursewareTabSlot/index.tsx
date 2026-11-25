import { Slot } from '@openedx/frontend-base';

export const coursewareTabSlotId = 'org.openedx.frontend.slot.learning.coursewareTab.v1';

export interface CoursewareTabSlotProps {
  courseId: string;
  sequenceId?: string;
  unitId?: string;
  isPreview?: boolean;
}

const CoursewareTabSlot = ({
  courseId, sequenceId, unitId, isPreview,
}: CoursewareTabSlotProps) => (
  <Slot id={coursewareTabSlotId} courseId={courseId} sequenceId={sequenceId} unitId={unitId} isPreview={isPreview} />
);

export default CoursewareTabSlot;

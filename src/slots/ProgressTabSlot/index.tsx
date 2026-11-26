import { Slot } from '@openedx/frontend-base';

export const progressTabSlotId = 'org.openedx.frontend.slot.learning.progressTab.v1';

export interface ProgressTabSlotProps {
  courseId: string;
  /** Another learner's ID, for staff to see that learner's progress. */
  targetUserId?: string;
}

const ProgressTabSlot = ({ courseId, targetUserId }: ProgressTabSlotProps) => (
  <Slot id={progressTabSlotId} courseId={courseId} targetUserId={targetUserId} />
);

export default ProgressTabSlot;

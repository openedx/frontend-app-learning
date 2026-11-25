import { Slot } from '@openedx/frontend-base';

export const sequenceContainerSlotId = 'org.openedx.frontend.slot.learning.sequenceContainer.v1';

export interface SequenceContainerSlotProps {
  courseId: string;
  sequenceId: string | null;
  unitId: string | null;
}

const SequenceContainerSlot = ({ courseId, sequenceId, unitId }: SequenceContainerSlotProps) => (
  <Slot id={sequenceContainerSlotId} courseId={courseId} sequenceId={sequenceId} unitId={unitId} />
);

export default SequenceContainerSlot;

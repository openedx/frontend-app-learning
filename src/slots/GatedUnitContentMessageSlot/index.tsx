import { Slot } from '@openedx/frontend-base';

import LockPaywall from '@src/courseware/course/sequence/lock-paywall';

export const gatedUnitContentMessageSlotId = 'org.openedx.frontend.slot.learning.gatedUnitContentMessage.v1';

export interface GatedUnitContentMessageSlotProps {
  courseId: string;
  sequenceId: string;
  unitId: string;
}

const GatedUnitContentMessageSlot = ({ courseId, sequenceId, unitId }: GatedUnitContentMessageSlotProps) => (
  <Slot id={gatedUnitContentMessageSlotId} courseId={courseId} sequenceId={sequenceId} unitId={unitId}>
    <LockPaywall courseId={courseId} />
  </Slot>
);

export default GatedUnitContentMessageSlot;

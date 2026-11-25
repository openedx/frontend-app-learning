import { Slot } from '@openedx/frontend-base';

export const sequenceNavigationSlotId = 'org.openedx.frontend.slot.learning.sequenceNavigation.v1';

export interface SequenceNavigationSlotProps {
  courseId: string;
  sequenceId: string;
  unitId: string | null;
  nextHandler: () => void;
  onNavigate: (unitId: string) => void;
  previousHandler: () => void;
}

const SequenceNavigationSlot = ({
  courseId, sequenceId, unitId, nextHandler, onNavigate, previousHandler,
}: SequenceNavigationSlotProps) => (
  <Slot
    id={sequenceNavigationSlotId}
    courseId={courseId}
    sequenceId={sequenceId}
    unitId={unitId}
    nextHandler={nextHandler}
    onNavigate={onNavigate}
    previousHandler={previousHandler}
  />
);

export default SequenceNavigationSlot;

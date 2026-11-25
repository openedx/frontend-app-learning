import { Slot } from '@openedx/frontend-base';

import { UnitNavigation } from '@src/courseware/course/sequence/sequence-navigation';

export const sequenceBottomNavigationSlotId = 'org.openedx.frontend.slot.learning.sequenceBottomNavigation.v1';

export interface SequenceBottomNavigationSlotProps {
  courseId: string;
  sequenceId: string;
  unitId: string | null;
  onClickNext: () => void;
  onNavigate: (unitId: string) => void;
  onClickPrevious: () => void;
}

const SequenceBottomNavigationSlot = ({
  courseId, sequenceId, unitId, onClickNext, onNavigate, onClickPrevious,
}: SequenceBottomNavigationSlotProps) => (
  <Slot
    id={sequenceBottomNavigationSlotId}
    courseId={courseId}
    sequenceId={sequenceId}
    unitId={unitId}
    onClickNext={onClickNext}
    onNavigate={onNavigate}
    onClickPrevious={onClickPrevious}
  >
    <UnitNavigation
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      isAtTop={false}
      onClickPrevious={onClickPrevious}
      onClickNext={onClickNext}
    />
  </Slot>
);

export default SequenceBottomNavigationSlot;

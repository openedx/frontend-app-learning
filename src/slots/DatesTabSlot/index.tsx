import { Slot } from '@openedx/frontend-base';

export const datesTabSlotId = 'org.openedx.frontend.slot.learning.datesTab.v1';

export interface DatesTabSlotProps {
  courseId: string;
}

const DatesTabSlot = ({ courseId }: DatesTabSlotProps) => (
  <Slot id={datesTabSlotId} courseId={courseId} />
);

export default DatesTabSlot;

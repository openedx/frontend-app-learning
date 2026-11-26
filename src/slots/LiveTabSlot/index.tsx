import { Slot } from '@openedx/frontend-base';

export const liveTabSlotId = 'org.openedx.frontend.slot.learning.liveTab.v1';

export interface LiveTabSlotProps {
  courseId: string;
}

const LiveTabSlot = ({ courseId }: LiveTabSlotProps) => (
  <Slot id={liveTabSlotId} courseId={courseId} />
);

export default LiveTabSlot;

import { Slot } from '@openedx/frontend-base';

export const outlineTabSlotId = 'org.openedx.frontend.slot.learning.outlineTab.v1';

export interface OutlineTabSlotProps {
  courseId: string;
}

const OutlineTabSlot = ({ courseId }: OutlineTabSlotProps) => (
  <Slot id={outlineTabSlotId} courseId={courseId} />
);

export default OutlineTabSlot;

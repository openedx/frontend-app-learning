import { Slot } from '@openedx/frontend-base';

import SidebarTriggers from '@src/courseware/course/sidebar/SidebarTriggers';

export const auxiliarySidebarTriggerSlotId = 'org.openedx.frontend.slot.learning.auxiliarySidebarTrigger.v1';

export interface AuxiliarySidebarTriggerSlotProps {
  courseId: string;
  sequenceId: string | null;
  unitId: string | null;
}

// No default content. Its layout renders the triggers of the available sidebar widgets, in the order of their panels.
const AuxiliarySidebarTriggerSlot = ({ courseId, sequenceId, unitId }: AuxiliarySidebarTriggerSlotProps) => (
  <Slot
    id={auxiliarySidebarTriggerSlotId}
    layout={SidebarTriggers}
    courseId={courseId}
    sequenceId={sequenceId}
    unitId={unitId}
  />
);

export default AuxiliarySidebarTriggerSlot;

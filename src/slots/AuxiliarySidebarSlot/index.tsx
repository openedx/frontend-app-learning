import { Slot } from '@openedx/frontend-base';

import Sidebar from '@src/courseware/course/sidebar/Sidebar';

export const auxiliarySidebarSlotId = 'org.openedx.frontend.slot.learning.auxiliarySidebar.v1';

export interface AuxiliarySidebarSlotProps {
  courseId: string;
  sequenceId: string | null;
  unitId: string | null;
}

// No default content. Its layout renders only the panel of the sidebar widget that is open.
const AuxiliarySidebarSlot = ({ courseId, sequenceId, unitId }: AuxiliarySidebarSlotProps) => (
  <Slot
    id={auxiliarySidebarSlotId}
    layout={Sidebar}
    courseId={courseId}
    sequenceId={sequenceId}
    unitId={unitId}
  />
);

export default AuxiliarySidebarSlot;

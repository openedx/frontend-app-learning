import type { AuxiliarySidebarSlotProps } from '@src/slots/AuxiliarySidebarSlot';

// What the auxiliary sidebar slots pass the widget's trigger and panel; the widget reads the course and the unit.
export type DiscussionsWidgetProps = Pick<AuxiliarySidebarSlotProps, 'courseId' | 'unitId'>;

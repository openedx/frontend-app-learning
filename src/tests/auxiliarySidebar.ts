import { WidgetOperationTypes, type SlotOperation } from '@openedx/frontend-base';
import type { ComponentType } from 'react';

import type { AuxiliarySidebarWidgetOptions } from '@src/courseware/course/sidebar/auxiliarySidebarWidgets';
import { auxiliarySidebarSlotId } from '@src/slots/AuxiliarySidebarSlot';
import { auxiliarySidebarTriggerSlotId } from '@src/slots/AuxiliarySidebarTriggerSlot';

import { addTestApp } from './slots';

export interface TestSidebarWidget extends AuxiliarySidebarWidgetOptions {
  id: string;
  // The panel; a widget always has one, since the panel slot is where the sidebar finds its widgets.
  Panel?: ComponentType;
  // The trigger, if the test needs one.
  Trigger?: ComponentType;
  // Leave out the options operation, for a widget that relies on the defaults.
  noOptions?: boolean;
}

const EmptyPanel = () => null;

/*
 * Registers sidebar widgets for the current test only, the way a plugin does: an operation in each auxiliary sidebar
 * slot under the widget's ID, and an options operation on the panel, all in one app of their own. The widgets are
 * offered in the order given, which is the order of their panels in the slot.
 */
export function addSidebarWidgets(widgets: TestSidebarWidget[]) {
  const slots: SlotOperation[] = widgets.flatMap(({
    id, Panel = EmptyPanel, Trigger, noOptions, isAvailable, Provider,
  }) => [
    ...(Trigger ? [{
      slotId: auxiliarySidebarTriggerSlotId, id, op: WidgetOperationTypes.APPEND, component: Trigger,
    } as SlotOperation] : []),
    {
      slotId: auxiliarySidebarSlotId, id, op: WidgetOperationTypes.APPEND, component: Panel,
    } as SlotOperation,
    ...(noOptions ? [] : [{
      slotId: auxiliarySidebarSlotId,
      relatedId: id,
      op: WidgetOperationTypes.OPTIONS,
      options: { ...(isAvailable && { isAvailable }), ...(Provider && { Provider }) },
    } as SlotOperation]),
  ]);
  addTestApp({ slots });
}

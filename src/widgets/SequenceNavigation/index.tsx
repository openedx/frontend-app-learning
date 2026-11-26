import { WidgetOperationTypes, type WidgetAppendOperation } from '@openedx/frontend-base';

import { SequenceNavigation } from '@src/courseware/course/sequence/sequence-navigation';
import { sequenceNavigationSlotId, type SequenceNavigationSlotProps } from '@src/slots/SequenceNavigationSlot';

export const sequenceNavigationWidgetId = 'org.openedx.frontend.widget.learning.sequenceNavigation.v1';

// The unit tab strip, with the previous and next buttons around it.
const SequenceNavigationWidget = ({
  sequenceId, unitId, nextHandler, onNavigate, previousHandler,
}: SequenceNavigationSlotProps) => (
  <SequenceNavigation
    sequenceId={sequenceId}
    unitId={unitId}
    nextHandler={nextHandler}
    onNavigate={onNavigate}
    previousHandler={previousHandler}
  />
);

export const sequenceNavigationSlotOperation: WidgetAppendOperation = {
  slotId: sequenceNavigationSlotId,
  id: sequenceNavigationWidgetId,
  op: WidgetOperationTypes.APPEND,
  component: SequenceNavigationWidget as React.ComponentType,
};

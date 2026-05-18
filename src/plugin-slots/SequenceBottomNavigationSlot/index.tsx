import { UnitNavigation } from '@src/courseware/course/sequence/sequence-navigation';
import React from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

export interface SequenceBottomNavigationSlotProps {
  courseId: string;
  sequenceId: string;
  unitId: string;
  nextHandler: () => void;
  onNavigate: (unitId: string) => void;
  previousHandler: () => void;
}

const SequenceBottomNavigationSlot = ({
  courseId,
  sequenceId,
  unitId,
  nextHandler,
  onNavigate,
  previousHandler,
}: SequenceBottomNavigationSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.sequence_bottom_navigation.v1"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      courseId,
      sequenceId,
      unitId,
      nextHandler,
      onNavigate,
      previousHandler,
    }}
  >
    <UnitNavigation
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      isAtTop={false}
      onClickPrevious={previousHandler}
      onClickNext={nextHandler}
    />
  </PluginSlot>
);

export default SequenceBottomNavigationSlot;

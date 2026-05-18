import { UnitNavigation } from '@src/courseware/course/sequence/sequence-navigation';
import React from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

export interface SequenceBottomNavigationSlotProps {
  courseId: string;
  sequenceId: string;
  unitId: string;
  onClickNext: () => void;
  onNavigate: (unitId: string) => void;
  onClickPrevious: () => void;
}

const SequenceBottomNavigationSlot = ({
  courseId,
  sequenceId,
  unitId,
  onClickNext,
  onNavigate,
  onClickPrevious,
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
      onClickNext,
      onNavigate,
      onClickPrevious,
    }}
  >
    <UnitNavigation
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      isAtTop={false}
      onClickPrevious={onClickPrevious}
      onClickNext={onClickNext}
    />
  </PluginSlot>
);

export default SequenceBottomNavigationSlot;

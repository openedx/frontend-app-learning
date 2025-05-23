import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { SequenceNavigation } from '../../courseware/course/sequence/sequence-navigation';

interface Props {
  sequenceId: string;
  unitId: string;
  nextHandler: () => void;
  onNavigate: () => void;
  previousHandler: () => void;
}

const SequenceNavigationSlot : React.FC<Props> = ({
  sequenceId,
  unitId,
  nextHandler,
  onNavigate,
  previousHandler,
}) => (
  <PluginSlot
    id="org.openedx.frontend.learning.sequence_navigation.v1"
    idAliases={['sequence_navigation_slot']}
    slotOptions={{
      mergeProps: true,
      keepDefault: false,
    }}
    pluginProps={{
      sequenceId,
      unitId,
      nextHandler,
      onNavigate,
      previousHandler,
    }}
  >
    <SequenceNavigation
      sequenceId={sequenceId}
      unitId={unitId}
      nextHandler={nextHandler}
      onNavigate={onNavigate}
      previousHandler={previousHandler}
    />
  </PluginSlot>
);

export default SequenceNavigationSlot;

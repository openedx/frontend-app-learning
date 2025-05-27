import React from 'react';
import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { SequenceNavigation } from '../../courseware/course/sequence/sequence-navigation';

const SequenceNavigationSlot = ({
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

SequenceNavigationSlot.propTypes = {
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  nextHandler: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  previousHandler: PropTypes.func.isRequired,
};

export default SequenceNavigationSlot;

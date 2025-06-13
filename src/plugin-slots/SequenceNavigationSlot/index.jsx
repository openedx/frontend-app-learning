import React from 'react';
import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const SequenceNavigationSlot = ({
  sequenceId,
  unitId,
  nextHandler,
  onNavigate,
  previousHandler,
}) => (
  <PluginSlot
    id="org.openedx.frontend.learning.sequence_navigation.v2"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      sequenceId,
      unitId,
      nextHandler,
      onNavigate,
      previousHandler,
    }}
  />
);

SequenceNavigationSlot.propTypes = {
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  nextHandler: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  previousHandler: PropTypes.func.isRequired,
};

export default SequenceNavigationSlot;

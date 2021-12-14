import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { OkayButtonFormattedMessage } from './GenericTourFormattedMessages';

const abandonTour = ({ enabled, onEnd }) => ({
  checkpoints: [{
    body: <FormattedMessage
      id="tours.abandonTour.launchTourCheckpoint.body"
      defaultMessage="Feeling lost? Launch the tour any time for some quick tips to get the most out of the experience."
    />,
    placement: 'left',
    target: '#courseHome-launchTourLink',
  }],
  enabled,
  endButtonText: <OkayButtonFormattedMessage />,
  onEnd,
  onEscape: onEnd,
  tourId: 'abandonTour',
});

export default abandonTour;

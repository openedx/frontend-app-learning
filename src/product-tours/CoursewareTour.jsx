import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { OkayButtonFormattedMessage } from './GenericTourFormattedMessages';

const coursewareTour = ({ enabled, onEnd }) => ({
  checkpoints: [{
    body: <FormattedMessage
      id="tours.sequenceNavigationCheckpoint.body"
      defaultMessage="The top bar within your course allows you to easily jump to different sections and shows you what’s coming up."
    />,
    placement: 'bottom',
    target: '#courseware-sequenceNavigation',
  }],
  enabled,
  endButtonText: <OkayButtonFormattedMessage />,
  onEnd,
  onEscape: onEnd,
  tourId: 'coursewareTour',
});

export default coursewareTour;

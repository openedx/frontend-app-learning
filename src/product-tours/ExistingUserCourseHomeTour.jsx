import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { OkayButtonFormattedMessage } from './GenericTourFormattedMessages';

const existingUserCourseHomeTour = ({ enabled, onEnd }) => ({
  checkpoints: [{
    body: <FormattedMessage
      id="tours.existingUserTour.launchTourCheckpoint.body"
      defaultMessage="We’ve recently added a few new features to the course experience. Want some help looking around? Take a tour to learn more."
    />,
    placement: 'left',
    target: '#courseHome-launchTourLink',
  }],
  enabled,
  endButtonText: <OkayButtonFormattedMessage />,
  onEnd,
  onEscape: onEnd,
  tourId: 'existingUserCourseHomeTour',
});

export default existingUserCourseHomeTour;

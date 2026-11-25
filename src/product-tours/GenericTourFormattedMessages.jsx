import React from 'react';
import { FormattedMessage } from '@openedx/frontend-base';

export const NextButtonFormattedMessage = () => (
  <FormattedMessage
    id="tours.button.next"
    defaultMessage="Next"
    description="A button used within a tour of the website to advance to the next piece of information"
  />
);

export const OkayButtonFormattedMessage = () => (
  <FormattedMessage
    id="tours.button.okay"
    defaultMessage="Okay"
    description="A button used to end the tour of the website"
  />
);

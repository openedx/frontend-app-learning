import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  unsubscribeLoading: {
    id: 'learning.notification.preferences.unsubscribe.loading',
    defaultMessage: 'Loading',
    description: 'Screen-reader message shown while the unsubscribe request is processing',
  },
  unsubscribeSuccessHeading: {
    id: 'learning.notification.preferences.unsubscribe.successHeading',
    defaultMessage: 'Unsubscribe successful',
    description: 'Heading shown when the learner was unsubscribed from email digests',
  },
  unsubscribeSuccessMessage: {
    id: 'learning.notification.preferences.unsubscribe.successMessage',
    defaultMessage: 'You have successfully unsubscribed from email digests for learning activity',
    description: 'Message shown when the learner was unsubscribed from email digests',
  },
  unsubscribeFailedHeading: {
    id: 'learning.notification.preferences.unsubscribe.failedHeading',
    defaultMessage: 'Error unsubscribing from preference',
    description: 'Heading shown when the unsubscribe request failed',
  },
  unsubscribeFailedMessage: {
    id: 'learning.notification.preferences.unsubscribe.failedMessage',
    defaultMessage: 'Invalid Url or token expired',
    description: 'Message shown when the unsubscribe request failed',
  },
  preferenceCenterUrl: {
    id: 'learning.notification.preferences.unsubscribe.preferenceCenterUrl',
    defaultMessage: 'preferences page',
    description: 'Text of the link to the notification preferences in the account settings',
  },
});

export default messages;

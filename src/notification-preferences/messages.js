import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  unsubscribeSuccessHeading: {
    id: 'learning.notification.preferences.unsubscribe.successHeading',
    defaultMessage: 'Unsubscribe successful',
  },
  unsubscribeSuccessMessage: {
    id: 'learning.notification.preferences.unsubscribe.successMessage',
    defaultMessage: 'You have successfully unsubscribed from email digests for learning activity',
  },
  unsubscribeFailedHeading: {
    id: 'learning.notification.preferences.unsubscribe.failedHeading',
    defaultMessage: 'Error unsubscribing from preference',
  },
  unsubscribeFailedMessage: {
    id: 'learning.notification.preferences.unsubscribe.failedMessage',
    defaultMessage: 'Invalid Url or token expired',
  },
  preferencePagePreText: {
    id: 'learning.notification.preferences.unsubscribe.preferencePagePreText',
    defaultMessage: 'Go to the ',
  },
  preferencePageUrlText: {
    id: 'learning.notification.preferences.unsubscribe.preferencePageUrlText',
    defaultMessage: 'preferences page',
  },
  preferencePagePostText: {
    id: 'learning.notification.preferences.unsubscribe.preferencePagePostText',
    defaultMessage: ' to set your preferences',
  },
});

export default messages;

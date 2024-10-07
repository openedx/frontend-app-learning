import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  unsubscribeLoading: {
    id: 'learning.notification.preferences.unsubscribe.loading',
    defaultMessage: 'Loading',
  },
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
  preferenceCenterUrl: {
    id: 'learning.notification.preferences.unsubscribe.preferenceCenterUrl',
    defaultMessage: 'preferences page',
  },
});

export default messages;

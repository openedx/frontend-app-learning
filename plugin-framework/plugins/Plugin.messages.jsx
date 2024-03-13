import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loading: {
    id: 'loading.message.text',
    defaultMessage: 'Loading',
    description: 'the feature is currently loading',
  },
  unexpectedError: {
    id: 'unexpected.error.message.text',
    defaultMessage: ' Oops! An error occurred. Please refresh the screen to try again.',
    description: 'error message when an unexpected error occurs',
  },
});

export default messages;

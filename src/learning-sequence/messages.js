import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.loading.learning.sequence': {
    id: 'learn.loading.learning.sequence',
    defaultMessage: 'Loading learning sequence...',
    description: 'Message when learning sequence is being loaded',
  },
  'learn.loading.error': {
    id: 'learn.loading.error',
    defaultMessage: 'Error: {error}',
    description: 'Message when learning sequence fails to load',
  },
});

export default messages;

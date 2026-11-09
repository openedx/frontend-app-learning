import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  failure: {
    id: 'learning.pathways.loading.failure',
    defaultMessage: 'There was an error loading this pathway.',
    description: 'Can be because internet connection or any technical other reason',
  },
  loading: {
    id: 'learning.pathways.loading',
    defaultMessage: 'Loading pathway page…',
    description: 'When content of a pathway is still loading',
  },
});

export default messages;

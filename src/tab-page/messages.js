import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.loading': {
    id: 'learn.loading',
    defaultMessage: 'Loading course page...',
    description: 'Message when course page is being loaded',
  },
  'learn.loading.failure': {
    id: 'learn.loading.failure',
    defaultMessage: 'There was an error loading this course.',
    description: 'Message when a course page fails to load',
  },
});

export default messages;

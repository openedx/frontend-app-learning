import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  failure: {
    id: 'learning.loading.failure',
    defaultMessage: 'There was an error loading this course.',
  },
  loading: {
    id: 'learning.loading',
    defaultMessage: 'Loading course page…',
  },
  datesResetSuccessBody: {
    id: 'learning.datesResetSuccessBody',
    defaultMessage: 'View all dates',
  },
  datesResetSuccessHeader: {
    id: 'learning.datesResetSuccessHeader',
    defaultMessage: 'Your due dates have been successfully shifted to help you stay on track.',
  },
});

export default messages;

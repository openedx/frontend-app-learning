import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.navigation.course.tabs.label': {
    id: 'learn.navigation.course.tabs.label',
    defaultMessage: 'Course Material',
    description: 'The accessible label for course tabs navigation',
  },
  'learn.loading.learning.sequence': {
    id: 'learn.loading.learning.sequence',
    defaultMessage: 'Loading learning sequence...',
    description: 'Message when learning sequence is being loaded',
  },
  'learn.course.load.failure': {
    id: 'learn.course.load.failure',
    defaultMessage: 'There was an error loading this course.',
    description: 'Message when a course fails to load',
  },
});

export default messages;

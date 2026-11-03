import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  includedIn: {
    id: 'learning.coursePathways.includedIn',
    defaultMessage: 'Course included in',
    description: 'Label that precedes the pathways, in which the learner is enrolled, that include this course',
  },
  morePathways: {
    id: 'learning.coursePathways.morePathways',
    defaultMessage: 'Show {count, plural, one {# more pathway} other {# more pathways}}',
    description: 'Accessible label of the button that shows the pathways that do not fit in the course header',
  },
});

export default messages;

import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.loading.content.lock': {
    id: 'learn.loading.content.lock',
    defaultMessage: 'Loading locked content messaging...',
    description: 'Message shown when an interface about locked content is being loaded',
  },
  'learn.end.of.course': {
    id: 'learn.end.of.course',
    defaultMessage: "You've reached the end of this course!",
    description: "Message shown to students in place of a 'Next' button when they're at the end of a course.",
  },
});

export default messages;

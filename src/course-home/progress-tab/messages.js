import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  progressHeader: {
    id: 'progress.header',
    defaultMessage: 'Your progress',
  },
  progressHeaderForTargetUser: {
    id: 'progress.header.targetUser',
    defaultMessage: 'Course progress for {username}',
    description: 'Header when displaying the progress for a different user',
  },
  studioLink: {
    id: 'progress.link.studio',
    defaultMessage: 'View grading in Studio',
  },
});

export default messages;

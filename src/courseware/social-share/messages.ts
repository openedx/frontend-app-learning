import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  defaultEmailBody: {
    id: 'learning.celebration.emailBody',
    defaultMessage: 'What are you spending your time learning?',
    description: 'Body when sharing course progress via email',
  },
  shareEmail: {
    id: 'learning.social.shareEmail',
    defaultMessage: 'Share your progress via email.',
    description: 'Text email share button',
  },
  shareService: {
    id: 'learning.social.shareService',
    defaultMessage: 'Share your progress on {service}.',
  },
});

export default messages;

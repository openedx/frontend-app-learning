import { defineMessages } from '@openedx/frontend-base';

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
    description: 'Screen reader text for a share button; service is the social network, such as LinkedIn',
  },
});

export default messages;

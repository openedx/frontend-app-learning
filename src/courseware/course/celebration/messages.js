import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  completed: {
    id: 'learning.celebration.completed',
    defaultMessage: 'You just completed the first section of your course.',
  },
  congrats: {
    id: 'learning.celebration.congrats',
    defaultMessage: 'Congratulations!',
  },
  earned: {
    id: 'learning.celebration.earned',
    defaultMessage: 'You earned it!',
  },
  forward: {
    id: 'learning.celebration.forward',
    defaultMessage: 'Keep going',
    description: 'Button to close celebration dialog and get back to course',
  },
  share: {
    id: 'learning.celebration.share',
    defaultMessage: 'Take a moment to celebrate and share your progress.',
  },
  shareService: {
    id: 'learning.celebration.share.service',
    defaultMessage: 'Share your progress on {service}.',
  },
  social: {
    id: 'learning.celebration.social',
    defaultMessage: 'I’m on my way to completing {title} online with {platform}. What are you spending your time learning?',
    description: 'Shown when sharing course progress on a social network',
  },
});

export default messages;

import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  completed: {
    id: 'learning.celebration.completed',
    defaultMessage: 'You just completed the first section of your course.',
    description: 'Shown only once to leaner when they complete their first section',
  },
  congrats: {
    id: 'learning.celebration.congrats',
    defaultMessage: 'Congratulations!',
    description: 'Greeting for learners when they complete their weekly goal or finish the first section',
  },
  earned: {
    id: 'learning.celebration.earned',
    defaultMessage: 'You earned it!',
    description: 'Shown below congrats messaging when leaner complete a goal',
  },
  emailSubject: {
    id: 'learning.celebration.emailSubject',
    defaultMessage: "I'm on my way to completing {title} online with {platform}!",
    description: 'Subject when sharing course progress via email',
  },
  forward: {
    id: 'learning.celebration.forward',
    defaultMessage: 'Keep going',
    description: 'Button to close celebration dialog and get back to course',
  },
  goalMet: {
    id: 'learning.celebration.goalMet',
    defaultMessage: 'You met your goal!',
    description: 'Headline for (weekly gaol celebration) section in courseware',
  },
  keepItUp: {
    id: 'learning.celebration.keepItUp',
    defaultMessage: 'Keep it up',
    description: 'Button to close celebration dialog and get back to course',
  },
  share: {
    id: 'learning.celebration.share',
    defaultMessage: 'Take a moment to celebrate and share your progress.',
    description: 'Text that precedes the (sharing icon) for goal accomplishment ',
  },
  socialMessage: {
    id: 'learning.celebration.social',
    defaultMessage: 'I’m on my way to completing {title} online with {platform}. What are you spending your time learning?',
    description: 'Shown when sharing course progress on a social network',
  },
});

export default messages;

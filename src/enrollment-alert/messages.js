import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learning.enrollment.alert': {
    id: 'learning.enrollment.alert',
    defaultMessage: 'You must be enrolled in the course to see course content.',
    description: 'Message shown to indicate that a user needs to enroll in a course prior to viewing the course content.  Shown as part of an alert, along with a link to enroll.',
  },
  'learning.enrollment.enroll.now': {
    id: 'learning.enrollment.enroll.now',
    defaultMessage: 'Enroll Now',
    description: 'A link prompting the user to click on it to enroll in the currently viewed course.',
  },
});

export default messages;

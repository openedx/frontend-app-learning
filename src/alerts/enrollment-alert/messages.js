import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  alert: {
    id: 'learning.enrollment.alert',
    defaultMessage: 'You must be enrolled in the course to see course content.',
    description: 'Message shown to indicate that a user needs to enroll in a course prior to viewing the course content.  Shown as part of an alert, along with a link to enroll.',
  },
  staffAlert: {
    id: 'learning.staff.enrollment.alert',
    defaultMessage: 'You are viewing this course as staff, and are not enrolled.',
    description: 'Message shown to indicate that a user is not enrolled, but is able to view a course anyway because they are staff. Shown as part of an alert, along with a link to enroll.',
  },
  enroll: {
    id: 'learning.enrollment.enroll.now',
    defaultMessage: 'Enroll Now',
    description: 'A link prompting the user to click on it to enroll in the currently viewed course.',
  },
  success: {
    id: 'learning.enrollment.success',
    defaultMessage: 'You’ve successfully enrolled in this course!',
    description: 'A message telling the user that their course enrollment was successful.',
  },
});

export default messages;

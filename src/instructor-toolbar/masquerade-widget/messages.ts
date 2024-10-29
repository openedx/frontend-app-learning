import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  genericError: {
    id: 'masquerade-widget.userName.error.generic',
    defaultMessage: 'An error has occurred; please try again.',
    description: 'Message shown after a general error when attempting to masquerade',
  },
  placeholder: {
    id: 'masquerade-widget.userName.input.placeholder',
    defaultMessage: 'Username or email',
    description: 'Placeholder text to prompt for a user to masquerade as',
  },
  userNameLabel: {
    id: 'masquerade-widget.userName.input.label',
    defaultMessage: 'Masquerade as this user',
    description: 'Label for the masquerade user input',
  },
  titleViewAs: {
    id: 'instructor.toolbar.view.as',
    defaultMessage: 'View this course as:',
    description: 'Button to view this course as',
  },
  titleStaff: {
    id: 'instructor.toolbar.staff',
    defaultMessage: 'Staff',
    description: 'Button Staff',
  },
});

export default messages;

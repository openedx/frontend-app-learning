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
    defaultMessage: 'View this course as: ',
    description: 'Button to view this course as',
  },
  buttonStaff: {
    id: 'buttonStaff',
    defaultMessage: 'Staff',
    description: 'Button to see the different staff options',
  },
  buttonSpecificStudent: {
    id: 'buttonSpecificStudent',
    defaultMessage: 'Specific Student...',
    description: 'Button specific student',
  },
});

export default messages;

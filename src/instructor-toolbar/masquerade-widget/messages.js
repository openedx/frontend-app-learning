import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'status.groupName': {
    id: 'masquerade-widget.status.groupName',
    defaultMessage: 'You are masquerading as a learner in the {groupName} group.',
    description: 'Message when masquerading as a generic user in a specific track',
  },
  'status.learner': {
    id: 'masquerade-widget.status.learner',
    defaultMessage: 'You are masquerading as a learner.',
    description: 'Message when masquerading as a specific user',
  },
  'status.userName': {
    id: 'masquerade-widget.status.userName',
    defaultMessage: 'You are masquerading as the following user: {userName}',
    description: 'Message when masquerading as a specific user',
  },
  'userName.input.label': {
    id: 'masquerade-widget.userName.input.label',
    defaultMessage: 'Masquerade as this user',
    description: 'Label for the masquerade user input',
  },
  'userName.error.generic': {
    id: 'masquerade-widget.userName.error.generic',
    defaultMessage: 'An error has occurred; please try again.',
    description: 'Message shown after a general error when attempting to masquerade',
  },
  'userName.input.placeholder': {
    id: 'masquerade-widget.userName.input.placeholder',
    defaultMessage: 'username or email',
    description: 'Placeholder text to prompt for a user to masquerade as',
  },
});

export default messages;

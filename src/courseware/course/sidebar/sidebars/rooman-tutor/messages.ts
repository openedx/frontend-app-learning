import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  tutorTitle: {
    id: 'tools.rooman_tutor.title',
    defaultMessage: 'Rooman AI Tutor',
    description: 'Title of the in-course AI tutor sidebar',
  },
  openTutorTrigger: {
    id: 'tools.rooman_tutor.open',
    defaultMessage: 'Open Rooman AI Tutor',
    description: 'Aria-label for the button that opens the AI tutor sidebar',
  },
  placeholderEmpty: {
    id: 'tools.rooman_tutor.placeholder.empty',
    defaultMessage: 'Ask anything about this lesson…',
    description: 'Empty-state hint shown in the chat history pane',
  },
  inputPlaceholder: {
    id: 'tools.rooman_tutor.placeholder.input',
    defaultMessage: 'Ask the tutor…',
    description: 'Placeholder text inside the message text-area',
  },
  send: {
    id: 'tools.rooman_tutor.send',
    defaultMessage: 'Send',
    description: 'Label on the chat send button',
  },
  sending: {
    id: 'tools.rooman_tutor.sending',
    defaultMessage: 'Sending…',
    description: 'Label on the send button while a reply is in flight',
  },
  errorPrefix: {
    id: 'tools.rooman_tutor.error.prefix',
    defaultMessage: 'Tutor couldn\'t answer:',
    description: 'Prefix for an error message shown to the learner',
  },
});

export default messages;

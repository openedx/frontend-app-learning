import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  popoverTitle: {
    id: 'popover.title',
    defaultMessage: 'Need help understanding course content?',
    description: 'Title for popover alerting user of chat modal',
  },
  popoverContent: {
    id: 'popover.content',
    defaultMessage: 'Click here for your Xpert Learning Assistant.',
    description: 'Content of the popover message',
  },
  openChatModalTrigger: {
    id: 'chat.model.trigger',
    defaultMessage: 'Show chat modal',
    description: 'Alt text for button that opens the chat modal',
  },
  modalTitle: {
    id: 'chat.model.title',
    defaultMessage: 'Xpert Learning Assistant',
    description: 'Title for chat modal header',
  },
});

export default messages;

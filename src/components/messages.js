import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  aiwidgetHeader: {
    id: 'aiwidget.header',
    defaultMessage: 'Smart Guide',
    description: 'Headline or title for the AI Widget',
  },
  aiwidgetLabel: {
    id: 'aiwidget.label',
    defaultMessage: 'Ask me about the course',
    description: 'Shown as label for the input and no questions asked',
  },
  aiwidgetPrompts: {
    id: 'aiwidget.prompts',
    defaultMessage: 'You have: {prompts} prompts',
    description: 'Shown number of Prompts',
  },
});

export default messages;

import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  completionTitle: {
    id: 'learning.pathways.progress.completion.title',
    defaultMessage: '{categoryLabel} completion',
    description: 'Title of the Completion section',
  },
  completionDescription: {
    id: 'learning.pathways.progress.completion.description',
    defaultMessage: 'This represents how many items you have completed in this {categoryLabel}.',
    description: 'Description of the Completion section',
  },
});

export default messages;

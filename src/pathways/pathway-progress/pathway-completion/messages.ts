import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  completed: {
    id: 'learning.pathways.progress.donut.completed',
    defaultMessage: 'completed',
    description: 'Label shown below the completed/total count in the center of the pathway progress donut chart',
  },
  completedItems: {
    id: 'learning.pathways.progress.donut.completedItems',
    defaultMessage: '{completed} of {total} items completed',
    description: 'Accessible label of the pathway progress donut chart',
  },
  completionTitle: {
    id: 'learning.pathways.progress.completion.title',
    defaultMessage: '{categoryLabel} completion',
    description: 'Title of the Completion section',
  },
  completionDescription: {
    id: 'learning.pathways.progress.completion.description',
    defaultMessage: 'This represents how many courses you have completed in this {categoryLabel}.',
    description: 'Description of the Completion section',
  },
});

export default messages;

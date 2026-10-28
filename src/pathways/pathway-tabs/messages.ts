import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pathwayMaterial: {
    id: 'learning.pathways.tabs.navigation.label',
    defaultMessage: 'Pathway Material',
    description: 'The accessible label for pathway tabs navigation',
  },
  home: {
    id: 'learning.pathways.tabs.home',
    defaultMessage: 'Outline',
    description: 'Title of the pathway tab that shows the pathway outline',
  },
  progress: {
    id: 'learning.pathways.tabs.progress',
    defaultMessage: 'Progress',
    description: 'Title of the pathway tab that shows the learner progress in the pathway',
  },
  achievements: {
    id: 'learning.pathways.tabs.achievements',
    defaultMessage: 'Achievements',
    description: 'Title of the pathway tab that shows the learner achievements in the pathway',
  },
});

export default messages;

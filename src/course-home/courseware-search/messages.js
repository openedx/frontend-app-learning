import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  searchOpenAction: {
    id: 'learn.coursewareSerch.openAction',
    defaultMessage: 'Search within this course',
    description: 'Aria-label for a button that will pop up Courseware Search.',
  },
  searchCloseAction: {
    id: 'learn.coursewareSerch.closeAction',
    defaultMessage: 'Close the search form',
    description: 'Aria-label for a button that will close Courseware Search.',
  },
  searchModuleTitle: {
    id: 'learn.coursewareSerch.searchModuleTitle',
    defaultMessage: 'Search this course',
    description: 'Title for the Courseware Search module.',
  },
  searchBarPlaceholderText: {
    id: 'learn.coursewareSerch.searchBarPlaceholderText',
    defaultMessage: 'Search',
    description: 'Placeholder text courseware for the search bar.',
  },
});

export default messages;

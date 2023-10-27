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
    description: 'Placeholder text for the Courseware Search input control',
  },
  searchResultsNone: {
    id: 'learn.coursewareSerch.searchResultsNone',
    defaultMessage: 'No results found.',
    description: 'Text to show when the Courseware Search found no results matching the criteria.',
  },
});

export default messages;

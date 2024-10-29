import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  searchOpenAction: {
    id: 'learn.coursewareSearch.openAction',
    defaultMessage: 'Search within this course',
    description: 'Aria-label for a button that will pop up Courseware Search.',
  },
  contentSearchButton: {
    id: 'learn.coursewareSearch.contentSearchButton',
    defaultMessage: 'Content search',
    description: 'Text for a button that will pop up Courseware Search.',
  },
  searchSubmitLabel: {
    id: 'learn.coursewareSearch.submitLabel',
    defaultMessage: 'Search',
    description: 'Button label that will submit Courseware Search.',
  },
  searchClearAction: {
    id: 'learn.coursewareSearch.clearAction',
    defaultMessage: 'Clear search',
    description: 'Button label that will the current Courseware Search input.',
  },
  searchCloseAction: {
    id: 'learn.coursewareSearch.closeAction',
    defaultMessage: 'Close the search form',
    description: 'Aria-label for a button that will close Courseware Search.',
  },
  searchModuleTitle: {
    id: 'learn.coursewareSearch.searchModuleTitle',
    defaultMessage: 'Search this course',
    description: 'Title for the Courseware Search module.',
  },
  searchBarPlaceholderText: {
    id: 'learn.coursewareSearch.searchBarPlaceholderText',
    defaultMessage: 'Search',
    description: 'Placeholder text for the Courseware Search input control',
  },
  loading: {
    id: 'learn.coursewareSearch.loading',
    defaultMessage: 'Searching...',
    description: 'Screen reader text to use on the spinner while the search is performing.',
  },
  searchResultsNone: {
    id: 'learn.coursewareSearch.searchResultsNone',
    defaultMessage: 'No results found.',
    description: 'Text to show when the Courseware Search found no results matching the criteria.',
  },
  searchResultsLabel: {
    id: 'learn.coursewareSearch.searchResultsLabel',
    defaultMessage: 'Results for "{keyword}":',
    description: 'Text to show above the search results response list.',
  },
  searchResultsError: {
    id: 'learn.coursewareSearch.searchResultsError',
    defaultMessage: 'There was an error on the search process. Please try again in a few minutes. If the problem persists, please contact the support team.',
    description: 'Error message to show to the users when there\'s an error with the endpoint or the returned payload format.',
  },

  // These are translations for labeling the filters
  'filter:all': {
    id: 'learn.coursewareSearch.filter:all',
    defaultMessage: 'All content',
    description: 'Label for the search results filter that shows all content (no filter).',
  },
  'filter:text': {
    id: 'learn.coursewareSearch.filter:text',
    defaultMessage: 'Text',
    description: 'Label for the search results filter that shows results with text content.',
  },
  'filter:video': {
    id: 'learn.coursewareSearch.filter:video',
    defaultMessage: 'Video',
    description: 'Label for the search results filter that shows results with video content.',
  },
  'filter:sequence': {
    id: 'learn.coursewareSearch.filter:sequence',
    defaultMessage: 'Section',
    description: 'Label for the search results filter that shows results with section content.',
  },
  'filter:other': {
    id: 'learn.coursewareSearch.filter:other',
    defaultMessage: 'Other',
    description: 'Label for the search results filter that shows results with other content.',
  },
});

export default messages;

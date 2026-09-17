import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  importantDates: {
    id: 'progress.importantDates.title',
    defaultMessage: 'Important dates',
    description: 'Title for the important dates section on the progress page',
  },
  today: {
    id: 'progress.importantDates.badge.today',
    defaultMessage: 'Today',
    description: 'Badge shown when a date is today',
  },
  pastDue: {
    id: 'progress.importantDates.badge.pastDue',
    defaultMessage: 'Past due',
    description: 'Badge shown for dates that have passed',
  },
  dueNext: {
    id: 'progress.importantDates.badge.dueNext',
    defaultMessage: 'Due next',
    description: 'Badge shown for the next upcoming assignment',
  },
  completed: {
    id: 'progress.importantDates.badge.completed',
    defaultMessage: 'Completed',
    description: 'Badge shown for completed assignments',
  },
  noImportantDates: {
    id: 'progress.importantDates.noDates',
    defaultMessage: 'No important dates to display.',
    description: 'Message shown when there are no important dates',
  },
  viewAllDates: {
    id: 'progress.importantDates.viewAllDates',
    defaultMessage: 'View all dates',
    description: 'Link text to view all dates on the dates tab',
  },
  loadingDates: {
    id: 'progress.importantDates.loadingDates',
    defaultMessage: 'Loading dates...',
    description: 'Message shown while dates are loading',
  },
});

export default messages;

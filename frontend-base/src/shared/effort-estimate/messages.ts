import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  activities: {
    id: 'learning.effortEstimation.activities',
    defaultMessage: '{activityCount, plural, one {# activity} other {# activities}}',
    description: 'Number of activities in a sequence, shown beside or in place of its estimated time: 2 activities',
  },
  minutesAbbreviated: {
    id: 'learning.effortEstimation.minutesAbbreviated',
    defaultMessage: '{minuteCount, plural, one {# min} other {# min}}',
    description: 'Number of minutes in a casual, shorthand manner: 5 min',
  },
  minutesFull: {
    id: 'learning.effortEstimation.minutesFull',
    defaultMessage: '{minuteCount, plural, one {# minute} other {# minutes}}',
    description: 'Number of minutes spelled out: 5 minutes',
  },
});

export default messages;

import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  contactSupport: {
    id: 'learning.goals.unsubscribe.contact',
    defaultMessage: 'contact support',
    description: 'Its shown as a suggestion or recommendation for learner when their unsubscribing request has failed',
  },
  description: {
    id: 'learning.goals.unsubscribe.description',
    defaultMessage: 'You will no longer receive email reminders about your goal for {courseTitle}.',
    description: 'It describes the consequences to learner when they unsubscribe of goal reminder service',
  },
  errorHeader: {
    id: 'learning.goals.unsubscribe.errorHeader',
    defaultMessage: 'Something went wrong',
    description: 'It indicate that the unsubscribing request has failed',
  },
  goToDashboard: {
    id: 'learning.goals.unsubscribe.goToDashboard',
    defaultMessage: 'Go to dashboard',
    description: 'Anchor text for button that redirects to dashboard page',
  },
  header: {
    id: 'learning.goals.unsubscribe.header',
    defaultMessage: 'You’ve unsubscribed from goal reminders',
    description: 'It indicate that the unsubscribing request was successful',
  },
  loading: {
    id: 'learning.goals.unsubscribe.loading',
    defaultMessage: 'Unsubscribing…',
    description: 'Message shown when the unsubscribing request is processing',
  },
});

export default messages;

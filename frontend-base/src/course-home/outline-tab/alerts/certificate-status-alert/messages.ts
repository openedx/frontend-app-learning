import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  certStatusEarnedNotAvailableHeader: {
    id: 'cert.alert.earned.unavailable.header.v2',
    defaultMessage: 'Your grade and certificate status will be available soon.',
    description: 'Header alerting the user that their certificate will be available soon.',
  },
  certStatusDownloadableHeader: {
    id: 'cert.alert.earned.ready.header',
    defaultMessage: 'Congratulations! Your certificate is ready.',
    description: 'Header alerting the user that their certificate is ready.',
  },
  certStatusNotPassingHeader: {
    id: 'cert.alert.notPassing.header',
    defaultMessage: 'You are not yet eligible for a certificate',
    description: 'Header of the alert shown once the course has ended to a learner without a passing grade',
  },
  certStatusNotPassingButton: {
    id: 'cert.alert.notPassing.button',
    defaultMessage: 'View grades',
    description: 'Button that opens the progress tab, in the alert for a learner without a passing grade',
  },
});

export default messages;

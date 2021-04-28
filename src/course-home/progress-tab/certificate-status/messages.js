import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notPassingHeader: {
    id: 'progress.certificateStatus.notPassingHeader',
    defaultMessage: 'Certificate status',
  },
  notPassingBody: {
    id: 'progress.certificateStatus.notPassingBody',
    defaultMessage: 'In order to qualify for a certificate, you must have a passing grade.',
  },
  inProgressHeader: {
    id: 'progress.certificateStatus.inProgressHeader',
    defaultMessage: 'More content is coming soon!',
  },
  inProgressBody: {
    id: 'progress.certificateStatus.inProgressBody',
    defaultMessage: 'It looks like there is more content in this course that will be released in the future. Look out for email updates or check back on your course for when this content will be available.',
  },
  requestableHeader: {
    id: 'progress.certificateStatus.requestableHeader',
    defaultMessage: 'Certificate status',
  },
  requestableBody: {
    id: 'progress.certificateStatus.requestableBody',
    defaultMessage: 'Congratulations, you qualified for a certificate! In order to access your certificate, request it below.',
  },
  requestableButton: {
    id: 'progress.certificateStatus.requestableButton',
    defaultMessage: 'Request certificate',
  },
  unverifiedHeader: {
    id: 'progress.certificateStatus.unverifiedHeader',
    defaultMessage: 'Certificate status',
  },
  unverifiedButton: {
    id: 'progress.certificateStatus.unverifiedButton',
    defaultMessage: 'Verify ID',
  },
  unverifiedPendingBody: {
    id: 'progress.certificateStatus.courseCelebration.verificationPending',
    defaultMessage: 'Your ID verification is pending and your certificate will be available once approved.',
  },
  downloadableHeader: {
    id: 'progress.certificateStatus.downloadableHeader',
    defaultMessage: 'Your certificate is available!',
  },
  downloadableBody: {
    id: 'progress.certificateStatus.downloadableBody',
    defaultMessage: 'Showcase your accomplishment on LinkedIn or your resume today. You can download your certificate now and access it any time from your Dashboard and Profile.',
  },
  downloadableButton: {
    id: 'progress.certificateStatus.downloadableButton',
    defaultMessage: 'Download my certificate',
  },
  viewableButton: {
    id: 'progress.certificateStatus.viewableButton',
    defaultMessage: 'View my certificate',
  },
  notAvailableHeader: {
    id: 'progress.certificateStatus.notAvailableHeader',
    defaultMessage: 'Certificate status',
  },
  notAvailableBody: {
    id: 'progress.certificateStatus.notAvailableBody',
    defaultMessage: 'Your certificate will be available soon! After this course officially ends on {end_date}, you will receive an email notification with your certificate.',
  },
  upgradeHeader: {
    id: 'progress.certificateStatus.upgradeHeader',
    defaultMessage: 'Earn a certificate',
  },
  upgradeBody: {
    id: 'progress.certificateStatus.upgradeBody',
    defaultMessage: 'You are in an audit track and do not qualify for a certificate. In order to work towards a certificate, upgrade your course today.',
  },
  upgradeButton: {
    id: 'progress.certificateStatus.upgradeButton',
    defaultMessage: 'Upgrade now',
  },
});

export default messages;

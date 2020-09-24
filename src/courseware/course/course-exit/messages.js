import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  certificateHeaderDownloadable: {
    id: 'courseCelebration.certificateHeader.downloadable',
    defaultMessage: 'Your certificate is available!',
    description: 'Text displayed when course certificate is ready to be downloaded',
  },
  certificateHeaderNotAvailable: {
    id: 'courseCelebration.certificateHeader.notAvailable',
    defaultMessage: 'Your certificate will be available soon!',
    description: 'Text displayed when course certificate is not yet available to view',
  },
  certificateHeaderUnverified: {
    id: 'courseCelebration.certificateHeader.unverified',
    defaultMessage: 'You must complete verification to receive your certificate.',
    description: 'Text displayed when a user has not verified their identity and cannot view their course certificate',
  },
  certificateHeaderRequestable: {
    id: 'courseCelebration.certificateHeader.requestable',
    defaultMessage: 'Congratulations, you qualified for a certificate!',
    description: 'Text displayed when a user has completed the course and can request a certificate',
  },
  congratulationsHeader: {
    id: 'courseCelebration.congratulationsHeader',
    defaultMessage: 'Congratulations!',
    description: 'Congratulations header on course completion page',
  },
  dashboardLink: {
    id: 'courseExit.dashboardLink',
    defaultMessage: 'Dashboard',
    description: "Link to learner's dashboard",
  },
  downloadButton: {
    id: 'courseCelebration.downloadButton',
    defaultMessage: 'Download my certificate',
    description: 'Text for download button in certificate banner',
  },
  idVerificationSupportLink: {
    id: 'courseExit.idVerificationSupportLink',
    defaultMessage: 'Learn more about ID verification',
    description: 'Link to help article about ID verification',
  },
  profileLink: {
    id: 'courseExit.profileLink',
    defaultMessage: 'Profile',
    description: 'Link to profile',
  },
  requestCertificateBodyText: {
    id: 'courseCelebration.requestCertificateBodyText',
    defaultMessage: 'In order to access your certificate, request it below.',
    description: 'Body text for certificate banner',
  },
  requestCertificateButton: {
    id: 'courseCelebration.requestCertificateButton',
    defaultMessage: 'Request certificate',
    description: 'Text for request certificate button in certificate banner',
  },
  shareHeader: {
    id: 'courseCelebration.shareHeader',
    defaultMessage: 'You have completed your course. Share your success on social media or email.',
    description: 'Social media/email share header',
  },
  verifyIdentityButton: {
    id: 'courseCelebration.verifyIdentityButton',
    defaultMessage: 'Verify now',
    description: 'Text for verify identity button in certificate banner',
  },
  viewCertificateButton: {
    id: 'courseCelebration.viewCertificateButton',
    defaultMessage: 'View now',
    description: 'Text for view certificate button in certificate banner',
  },
});

export default messages;

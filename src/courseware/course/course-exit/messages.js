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
    description: 'Text displayed when course certificate is not yet available to be viewed',
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
  certificateImage: {
    id: 'courseCelebration.certificateImage',
    defaultMessage: 'Sample certificate',
    description: 'Alt text used to describe an image of a certificate',
  },
  congratulationsHeader: {
    id: 'courseCelebration.congratulationsHeader',
    defaultMessage: 'Congratulations!',
  },
  congratulationsImage: {
    id: 'courseCelebration.congratulationsImage',
    defaultMessage: 'Four people raising their hands in celebration',
    description: 'Alt text used to describe celebratory image',
  },
  dashboardLink: {
    id: 'courseExit.dashboardLink',
    defaultMessage: 'Dashboard',
    description: "Link to user's dashboard",
  },
  downloadButton: {
    id: 'courseCelebration.downloadButton',
    defaultMessage: 'Download my certificate',
    description: 'Button to download the course certificate',
  },
  idVerificationSupportLink: {
    id: 'courseExit.idVerificationSupportLink',
    defaultMessage: 'Learn more about ID verification',
    description: 'Link to an article about identity verification',
  },
  profileLink: {
    id: 'courseExit.profileLink',
    defaultMessage: 'Profile',
    description: "Link to user's profile",
  },
  requestCertificateBodyText: {
    id: 'courseCelebration.requestCertificateBodyText',
    defaultMessage: 'In order to access your certificate, request it below.',
  },
  requestCertificateButton: {
    id: 'courseCelebration.requestCertificateButton',
    defaultMessage: 'Request certificate',
    description: 'Button to request the course certificate',
  },
  shareHeader: {
    id: 'courseCelebration.shareHeader',
    defaultMessage: 'You have completed your course. Share your success on social media or email.',
  },
  verifyIdentityButton: {
    id: 'courseCelebration.verifyIdentityButton',
    defaultMessage: 'Verify ID now',
    description: 'Button to verify the identify of the user',
  },
  viewCertificateButton: {
    id: 'courseCelebration.viewCertificateButton',
    defaultMessage: 'View my certificate',
    description: 'Button to view the course certificate',
  },
  viewCoursesButton: {
    id: 'courseExit.viewCoursesButton',
    defaultMessage: 'View my courses',
    description: 'Button to redirect user to their course dashboard',
  },
});

export default messages;

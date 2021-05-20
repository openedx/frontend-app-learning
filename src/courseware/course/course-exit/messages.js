import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  applyForCredit: {
    id: 'courseExit.programs.applyForCredit',
    defaultMessage: 'Apply for credit',
    description: 'Button for the learner to apply for course credit',
  },
  certificateHeaderDownloadable: {
    id: 'courseCelebration.certificateHeader.downloadable',
    defaultMessage: 'Your certificate is available!',
    description: 'Text displayed when course certificate is ready to be downloaded',
  },
  certificateHeaderNotAvailable: {
    id: 'courseCelebration.certificateHeader.notAvailable',
    defaultMessage: 'Your grade and certificate will be ready soon!',
    description: 'Header displayed when course certificate is not yet available to be viewed',
  },
  certificateNotAvailableBodyAccessCert: {
    id: 'courseCelebration.certificateBody.notAvailable.accessCertificate',
    defaultMessage: 'If you have earned a passing grade, your certificate will be automatically issued.',
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
  certificateHeaderUpgradable: {
    id: 'courseCelebration.certificateHeader.upgradable',
    defaultMessage: 'Upgrade to pursue a verified certificate',
  },
  certificateImage: {
    id: 'courseCelebration.certificateImage',
    defaultMessage: 'Sample certificate',
    description: 'Alt text used to describe an image of a certificate',
  },
  completedCourseHeader: {
    id: 'courseCelebration.completedCourseHeader',
    defaultMessage: 'You have completed your course.',
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
  courseInProgressDescription: {
    id: 'courseExit.courseInProgressDescription',
    defaultMessage: 'It looks like there is more content in this course that will be released in the future. Look out for email updates or check back on your course for when this content will be available.',
  },
  courseInProgressHeader: {
    id: 'courseExit.courseInProgressHeader',
    defaultMessage: 'More content is coming soon!',
  },
  dashboardLink: {
    id: 'courseExit.dashboardLink',
    defaultMessage: 'Dashboard',
    description: 'Link to user’s dashboard',
  },
  downloadButton: {
    id: 'courseCelebration.downloadButton',
    defaultMessage: 'Download my certificate',
    description: 'Button to download the course certificate',
  },
  endOfCourseDescription: {
    id: 'courseExit.endOfCourseDescription',
    defaultMessage: 'Unfortunately, you are not currently eligible for a certificate. You need to receive a passing grade to be eligible for a certificate.',
  },
  endOfCourseHeader: {
    id: 'courseExit.endOfCourseHeader',
    defaultMessage: 'You’ve reached the end of the course!',
  },
  endOfCourseTitle: {
    id: 'courseExit.endOfCourseTitle',
    defaultMessage: 'End of Course',
  },
  idVerificationSupportLink: {
    id: 'courseExit.idVerificationSupportLink',
    defaultMessage: 'Learn more about ID verification',
    description: 'Link to an article about identity verification',
  },
  linkedinAddToProfileButton: {
    id: 'courseCelebration.linkedinAddToProfileButton',
    defaultMessage: 'Add to LinkedIn profile',
    description: 'Button to add certificate information to the user’s LinkedIn profile',
  },
  microBachelorsLearnMore: {
    id: 'courseExit.programs.microBachelors.learnMore',
    defaultMessage: 'Learn more about how your MicroBachelors credential can be applied for credit.',
  },
  microMastersLearnMore: {
    id: 'courseExit.programs.microMasters.learnMore',
    defaultMessage: 'Learn more about the process of applying MicroMasters certificates to Master’s degrees.',
  },
  microMastersMessage: {
    id: 'courseExit.programs.microMasters.mastersMessage',
    defaultMessage: 'If you’re interested in using your MicroMasters certificate towards a Master’s program, you can get started today!',
  },
  nextButtonComplete: {
    id: 'learn.sequence.navigation.complete.button', // for historical reasons
    defaultMessage: 'Complete the course',
  },
  nextButtonEnd: {
    id: 'courseExit.nextButton.endOfCourse',
    defaultMessage: 'Next (end of course)',
  },
  profileLink: {
    id: 'courseExit.profileLink',
    defaultMessage: 'Profile',
    description: 'Link to user’s profile',
  },
  programsLastCourseHeader: {
    id: 'courseExit.programs.lastCourse',
    defaultMessage: 'You have completed the last course in {title}!',
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
  searchOurCatalogLink: {
    id: 'courseExit.searchOurCatalogLink',
    defaultMessage: 'Search our catalog',
    description: 'First part of a sentence that continues afterward',
  },
  shareMessage: {
    id: 'courseCelebration.shareMessage',
    defaultMessage: 'Share your success on social media or email.',
  },
  socialMessage: {
    id: 'courseExit.social.shareCompletionMessage',
    defaultMessage: 'I just completed {title} with {platform}!',
    description: 'Shown when sharing course progress on a social network',
  },
  upgradeButton: {
    id: 'courseExit.upgradeButton',
    defaultMessage: 'Upgrade now',
  },
  upgradeLink: {
    id: 'courseExit.upgradeLink',
    defaultMessage: 'upgrade now',
  },
  verificationPending: {
    id: 'courseCelebration.verificationPending',
    defaultMessage: 'Your ID verification is pending and your certificate will be available once approved.',
  },
  verifiedCertificateSupportLink: {
    id: 'courseExit.verifiedCertificateSupportLink',
    defaultMessage: 'Learn more about verified certificates',
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
  viewCourseScheduleButton: {
    id: 'courseExit.viewCourseScheduleButton',
    defaultMessage: 'View course schedule',
    description: 'Button to view the course schedule',
  },
  viewCoursesButton: {
    id: 'courseExit.viewCoursesButton',
    defaultMessage: 'View my courses',
    description: 'Button to redirect user to their course dashboard',
  },
  viewGradesButton: {
    id: 'courseExit.viewGradesButton',
    defaultMessage: 'View grades',
  },

});

export default messages;

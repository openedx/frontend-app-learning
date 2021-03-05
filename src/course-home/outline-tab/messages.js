import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  allDates: {
    id: 'learning.outline.dates.all',
    defaultMessage: 'View all course dates',
  },
  collapseAll: {
    id: 'learning.outline.collapseAll',
    defaultMessage: 'Collapse all',
    description: 'Label for button to close all of the collapsible sections',
  },
  completedAssignment: {
    id: 'learning.outline.completedAssignment',
    defaultMessage: 'Completed',
    description: 'Text used to describe the green checkmark icon in front of an assignment title',
  },
  completedSection: {
    id: 'learning.outline.completedSection',
    defaultMessage: 'Completed section',
    description: 'Text used to describe the green checkmark icon in front of a section title',
  },
  dates: {
    id: 'learning.outline.dates',
    defaultMessage: 'Upcoming Dates',
  },
  editGoal: {
    id: 'learning.outline.editGoal',
    defaultMessage: 'Edit goal',
    description: 'Edit course goal button',
  },
  expandAll: {
    id: 'learning.outline.expandAll',
    defaultMessage: 'Expand all',
    description: 'Label for button to open all of the collapsible sections',
  },
  goal: {
    id: 'learning.outline.goal',
    defaultMessage: 'Goal',
    description: 'Label for the selected course goal',
  },
  goalUnsure: {
    id: 'learning.outline.goalUnsure',
    defaultMessage: 'Not sure yet',
  },
  handouts: {
    id: 'learning.outline.handouts',
    defaultMessage: 'Course Handouts',
  },
  incompleteAssignment: {
    id: 'learning.outline.incompleteAssignment',
    defaultMessage: 'Incomplete',
    description: 'Text used to describe the gray checkmark icon in front of an assignment title',
  },
  incompleteSection: {
    id: 'learning.outline.incompleteSection',
    defaultMessage: 'Incomplete section',
    description: 'Text used to describe the gray checkmark icon in front of a section title',
  },
  learnMore: {
    id: 'learning.outline.learnMore',
    defaultMessage: 'Learn More',
  },
  openSection: {
    id: 'learning.outline.altText.openSection',
    defaultMessage: 'Open',
    description: 'A button to open the given section of the course outline',
  },
  resume: {
    id: 'learning.outline.resume',
    defaultMessage: 'Resume course',
  },
  setGoal: {
    id: 'learning.outline.setGoal',
    defaultMessage: 'To start, set a course goal by selecting the option below that best describes your learning plan.',
  },
  start: {
    id: 'learning.outline.start',
    defaultMessage: 'Start Course',
  },
  tools: {
    id: 'learning.outline.tools',
    defaultMessage: 'Course Tools',
  },
  upgradeButton: {
    id: 'learning.outline.upgradeButton',
    defaultMessage: 'Upgrade ({symbol}{price})',
  },
  upgradeTitle: {
    id: 'learning.outline.upgradeTitle',
    defaultMessage: 'Pursue a verified certificate',
  },
  upsellFirstPurchaseDiscount: {
    id: 'learning.outline.upsellFirstPurchaseDiscount',
    defaultMessage: '15% First-Time Learner Discount',
  },
  certAlt: {
    id: 'learning.outline.certificateAlt',
    defaultMessage: 'Example Certificate',
    description: 'Alternate text displayed when the example certificate image cannot be displayed.',
  },
  welcomeMessage: {
    id: 'learning.outline.welcomeMessage',
    defaultMessage: 'Welcome Message',
  },
  welcomeMessageShowMoreButton: {
    id: 'learning.outline.welcomeMessageShowMoreButton',
    defaultMessage: 'Show More',
  },
  welcomeMessageShowLessButton: {
    id: 'learning.outline.welcomeMessageShowLessButton',
    defaultMessage: 'Show Less',
  },
  welcomeTo: {
    id: 'learning.outline.goalWelcome',
    defaultMessage: 'Welcome to',
    description: 'This precedes the title of the course',
  },
  proctoringInfoPanel: {
    id: 'learning.proctoringPanel.header',
    defaultMessage: 'This course contains proctored exams',
  },
  notStartedProctoringStatus: {
    id: 'learning.proctoringPanel.status.notStarted',
    defaultMessage: 'Not Started',
  },
  startedProctoringStatus: {
    id: 'learning.proctoringPanel.status.started',
    defaultMessage: 'Started',
  },
  submittedProctoringStatus: {
    id: 'learning.proctoringPanel.status.submitted',
    defaultMessage: 'Submitted',
  },
  verifiedProctoringStatus: {
    id: 'learning.proctoringPanel.status.verified',
    defaultMessage: 'Verified',
  },
  rejectedProctoringStatus: {
    id: 'learning.proctoringPanel.status.rejected',
    defaultMessage: 'Rejected',
  },
  errorProctoringStatus: {
    id: 'learning.proctoringPanel.status.error',
    defaultMessage: 'Error',
  },
  otherCourseApprovedProctoringStatus: {
    id: 'learning.proctoringPanel.status.otherCourseApproved',
    defaultMessage: 'Approved in Another Course',
  },
  expiringSoonProctoringStatus: {
    id: 'learning.proctoringPanel.status.expiringSoon',
    defaultMessage: 'Expiring Soon',
  },
  proctoringCurrentStatus: {
    id: 'learning.proctoringPanel.status',
    defaultMessage: 'Current Onboarding Status:',
  },
  notStartedProctoringMessage: {
    id: 'learning.proctoringPanel.message.notStarted',
    defaultMessage: 'You have not started your onboarding exam.',
  },
  startedProctoringMessage: {
    id: 'learning.proctoringPanel.message.started',
    defaultMessage: 'You have started your onboarding exam.',
  },
  submittedProctoringMessage: {
    id: 'learning.proctoringPanel.message.submitted',
    defaultMessage: 'You have submitted your onboarding exam.',
  },
  verifiedProctoringMessage: {
    id: 'learning.proctoringPanel.message.verified',
    defaultMessage: 'You can now take proctored exams in this course.',
  },
  rejectedProctoringMessage: {
    id: 'learning.proctoringPanel.message.rejected',
    defaultMessage: 'Your onboarding exam has been rejected. Please retry onboarding.',
  },
  errorProctoringMessage: {
    id: 'learning.proctoringPanel.message.error',
    defaultMessage: 'An error has occurred during your onboarding exam. Please retry onboarding.',
  },
  otherCourseApprovedProctoringMessage: {
    id: 'learning.proctoringPanel.message.otherCourseApproved',
    defaultMessage: 'Your onboarding profile has been approved in another course, so you are eligible to take proctored exams in this course. However, it is highly recommended that you complete this course’s onboarding exam in order to ensure that your device still meets the requirements for proctoring.',
  },
  expiringSoonProctoringMessage: {
    id: 'learning.proctoringPanel.message.expiringSoon',
    defaultMessage: 'Your onboarding profile has been approved in another course, so you are eligible to take proctored exams in this course. However, your onboarding status is expiring soon. Please complete onboarding again to ensure that you will be able to continue taking proctored exams.',
  },
  proctoringPanelGeneralInfo: {
    id: 'learning.proctoringPanel.generalInfo',
    defaultMessage: 'You must complete the onboarding process prior to taking any proctored exam. ',
  },
  proctoringPanelGeneralInfoSubmitted: {
    id: 'learning.proctoringPanel.generalInfoSubmitted',
    defaultMessage: 'Your submitted profile is in review.',
  },
  proctoringPanelGeneralTime: {
    id: 'learning.proctoringPanel.generalTime',
    defaultMessage: 'Onboarding profile review, including identity verification, can take 2+ business days.',
  },
  proctoringOnboardingButton: {
    id: 'learning.proctoringPanel.onboardingButton',
    defaultMessage: 'Complete Onboarding',
  },
  proctoringOnboardingButtonNotOpen: {
    id: 'learning.proctoringPanel.onboardingButtonNotOpen',
    defaultMessage: 'Onboarding Opens: {releaseDate}',
  },
  proctoringReviewRequirementsButton: {
    id: 'learning.proctoringPanel.reviewRequirementsButton',
    defaultMessage: 'Review instructions and system requirements',
  },
});

export default messages;

import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  allDates: {
    id: 'learning.outline.dates.all',
    defaultMessage: 'View all course dates',
  },
  casualGoalButtonText: {
    id: 'learning.outline.goalButton.casual.text',
    defaultMessage: '1 day a week',
  },
  casualGoalButtonTitle: {
    id: 'learning.outline.goalButton.screenReader.text',
    defaultMessage: 'Casual',
    description: 'A very short description of the least intense of three learning goals',
  },
  certAlt: {
    id: 'learning.outline.certificateAlt',
    defaultMessage: 'Example Certificate',
    description: 'Alternate text displayed when the example certificate image cannot be displayed.',
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
    defaultMessage: 'Important dates',
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
  goalReminderDetail: {
    id: 'learning.outline.goalReminderDetail',
    defaultMessage: 'If we notice you’re not quite at your goal, we’ll send you an email reminder.',
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
  intenseGoalButtonText: {
    id: 'learning.outline.goalButton.intense.text',
    defaultMessage: '5 days a week',
  },
  intenseGoalButtonTitle: {
    id: 'learning.outline.goalButton.intense.title',
    defaultMessage: 'Intense',
    description: 'A very short description of the most intensive option of three learning goals, Casual, Regular and Intense',
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
  proctoringInfoPanel: {
    id: 'learning.proctoringPanel.header',
    defaultMessage: 'This course contains proctored exams',
  },
  regularGoalButtonText: {
    id: 'learning.outline.goalButton.regular.text',
    defaultMessage: '3 days a week',
  },
  regularGoalButtonTitle: {
    id: 'learning.outline.goalButton.regular.title',
    defaultMessage: 'Regular',
    description: 'A very short description of the middle option of three learning goals, Casual, Regular and Intense',
  },
  resumeBlurb: {
    id: 'learning.outline.resumeBlurb',
    defaultMessage: 'Pick up where you left off',
    description: 'Text describing to the learner that they can return to the last section they visited within the course.',
  },
  resume: {
    id: 'learning.outline.resume',
    defaultMessage: 'Resume course',
  },
  setGoal: {
    id: 'learning.outline.setGoal',
    defaultMessage: 'To start, set a course goal by selecting the option below that best describes your learning plan.',
  },
  setGoalReminder: {
    id: 'learning.outline.setGoalReminder',
    defaultMessage: 'Set a goal reminder',
  },
  setLearningGoalButtonScreenReaderText: {
    id: 'learning.outline.goalButton.casual.title',
    defaultMessage: 'Set a learning goal style.',
    description: 'screen reader text informing learner they can select an intensity of learning goal',
  },
  setWeeklyGoal: {
    id: 'learning.outline.setWeeklyGoal',
    defaultMessage: 'Set a weekly learning goal',
  },
  setWeeklyGoalDetail: {
    id: 'learning.outline.setWeeklyGoalDetail',
    defaultMessage: 'Setting a goal motivates you to finish the course. You can always change it later.',
  },
  start: {
    id: 'learning.outline.start',
    defaultMessage: 'Start course',
  },
  startBlurb: {
    id: 'learning.outline.startBlurb',
    defaultMessage: 'Begin your course today',
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
    defaultMessage: 'Your onboarding exam has been approved in this course.',
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
    defaultMessage: 'Your onboarding exam has been approved in another course.',
  },
  otherCourseApprovedProctoringDetail: {
    id: 'learning.proctoringPanel.detail.otherCourseApproved',
    defaultMessage: 'If your device has changed, we recommend that you complete this course\'s onboarding exam in order to ensure that your setup still meets the requirements for proctoring.',
  },
  expiringSoonProctoringMessage: {
    id: 'learning.proctoringPanel.message.expiringSoon',
    defaultMessage: 'Your onboarding profile has been approved in another course. However, your onboarding status is expiring soon. Please complete onboarding again to ensure that you will be able to continue taking proctored exams.',
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
    defaultMessage: 'Onboarding profile review can take 2+ business days.',
  },
  proctoringOnboardingButton: {
    id: 'learning.proctoringPanel.onboardingButton',
    defaultMessage: 'Complete Onboarding',
  },
  proctoringOnboardingPracticeButton: {
    id: 'learning.proctoringPanel.onboardingPracticeButton',
    defaultMessage: 'View Onboarding Exam',
  },
  proctoringOnboardingButtonNotOpen: {
    id: 'learning.proctoringPanel.onboardingButtonNotOpen',
    defaultMessage: 'Onboarding Opens: {releaseDate}',
  },
  proctoringReviewRequirementsButton: {
    id: 'learning.proctoringPanel.reviewRequirementsButton',
    defaultMessage: 'Review instructions and system requirements',
  },
  proctoringOnboardingButtonPastDue: {
    id: 'learning.proctoringPanel.onboardingButtonPastDue',
    defaultMessage: 'Onboarding Past Due',
  },
});

export default messages;

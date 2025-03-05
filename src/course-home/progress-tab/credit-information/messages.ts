import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  completed: {
    id: 'progress.creditInformation.completed',
    defaultMessage: 'Completed',
    description: 'Label text if a requirement for (course credit) is satisfied',
  },
  courseCredit: {
    id: 'progress.creditInformation.courseCredit',
    defaultMessage: 'course credit',
    description: 'Anchor text for link that redirects (course credit) help page',
  },
  minimumGrade: {
    id: 'progress.creditInformation.minimumGrade',
    defaultMessage: 'Minimum grade for credit ({minGrade}%)',
  },
  requirementsHeader: {
    id: 'progress.creditInformation.requirementsHeader',
    defaultMessage: 'Requirements for course credit',
    description: 'Header for the requirements section in course credit',
  },
  upcoming: {
    id: 'progress.creditInformation.upcoming',
    defaultMessage: 'Upcoming',
    description: 'It indicate that the a (credit requirement) status is not known yet',
  },
  verificationFailed: {
    id: 'progress.creditInformation.verificationFailed',
    defaultMessage: 'Verification failed',
    description: 'It indicate that the learner submitted a requirement but is either failed or declined',
  },
  verificationSubmitted: {
    id: 'progress.creditInformation.verificationSubmitted',
    defaultMessage: 'Verification submitted',
    description: 'It indicate that the learner submitted a requirement but is not graded or reviewed yet',
  },
  creditNotEligibleStatus: {
    id: 'progress.creditInformation.creditNotEligible',
    defaultMessage: 'You are no longer eligible for credit in this course. Learn more about {creditLink}.',
    description: 'Message to learner who are not eligible for course credit, it can because the a requirement deadline have passed',
  },
  creditEligibleStatus: {
    id: 'progress.creditInformation.creditEligible',
    defaultMessage: `You have met the requirements for credit in this course. Go to your
      {dashboardLink} to purchase course credit. Or learn more about {creditLink}.`,
    description: 'After the credit requirements are met, leaners can then do the last step which purchasing the credit. Note that is only doable for leaners after they met all the requirements',
  },
  creditPartialEligibleStatus: {
    id: 'progress.creditInformation.creditPartialEligible',
    defaultMessage: 'You have not yet met the requirements for credit. Learn more about {creditLink}.',
    description: 'This means that one or more requirements is not satisfied yet',
  },
});

export default messages;

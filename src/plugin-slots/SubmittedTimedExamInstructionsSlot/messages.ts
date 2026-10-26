import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'exam.submittedExamInstructions.title',
    defaultMessage: 'You have submitted your timed exam.',
    description: 'Heading shown after a learner submits a timed exam before its time limit.',
  },
  overtimeTitle: {
    id: 'exam.submittedExamInstructions.overtimeTitle',
    defaultMessage: 'The time allotted for this exam has expired. Your exam has been submitted and any work you completed will be graded.',
    description: 'Heading shown after a timed exam is submitted because its time limit ran out.',
  },
});

export default messages;

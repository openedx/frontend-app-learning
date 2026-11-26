import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  entranceExamTextNotPassing: {
    id: 'learn.sequence.entranceExamTextNotPassing',
    defaultMessage: 'To access course materials, you must score {entranceExamMinimumScorePct}% or higher on this exam. Your current score is {entranceExamCurrentScore}%.',
    description: 'Alert shown on an entrance exam the learner has not passed yet, with the passing score and their current score',
  },
  entranceExamTextPassed: {
    id: 'learn.sequence.entranceExamTextPassed',
    defaultMessage: 'Your score is {entranceExamCurrentScore}%. You have passed the entrance exam.',
    description: 'Alert shown on an entrance exam the learner has passed, with their score',
  },
});

export default messages;

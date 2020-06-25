import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  problem: {
    id: 'learning.progress.badge.problem',
    defaultMessage: 'Problem Scores: ',
  },
  practice: {
    id: 'learning.progress.badge.practice',
    defaultMessage: 'Practice Scores: ',
  },
  problemHiddenUntil: {
    id: 'learning.progress.badge.problemHiddenUntil',
    defaultMessage: 'Problem scores are hidden until the due date.',
  },
  practiceHiddenUntil: {
    id: 'learning.progress.badge.practiceHiddenUntil',
    defaultMessage: 'Practice scores are hidden until the due date.',
  },
  problemHidden: {
    id: 'learning.progress.badge.probHidden',
    defaultMessage: 'problemlem scores are hidden.',
  },
  practiceHidden: {
    id: 'learning.progress.badge.practiceHidden',
    defaultMessage: 'Practice scores are hidden.',
  },
  noScores: {
    id: 'learning.progress.badge.noScores',
    defaultMessage: 'No problem scores in this section.',
  },
  pointsEarned: {
    id: 'learning.progress.badge.scoreEarned',
    defaultMessage: '{earned} of {total} possible points',
  },
});

export default messages;

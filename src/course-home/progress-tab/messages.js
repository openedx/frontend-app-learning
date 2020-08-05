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
  viewCert: {
    id: 'learning.progress.badge.viewCert',
    defaultMessage: 'View Certificate',
  },
  downloadCert: {
    id: 'learning.progress.badge.downloadCert',
    defaultMessage: 'Download Your Certificate',
  },
  requestCert: {
    id: 'learning.progress.badge.requestCert',
    defaultMessage: 'Request Certificate',
  },
  opensNewWindow: {
    id: 'learning.progress.badge.opensNewWindow',
    defaultMessage: 'Opens in a new browser window',
  },
  certAlt: {
    id: 'learning.progress.badge.certAlt',
    defaultMessage: 'Example Certificate',
    description: 'Alternate text displayed when the example certificate image cannot be displayed.',
  },
  studioLink: {
    id: 'learning.progress.badge.studioLink',
    defaultMessage: 'View grading in studio',
  },
});

export default messages;

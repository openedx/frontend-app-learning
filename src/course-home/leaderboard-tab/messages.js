import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'leaderboard.title': {
    id: 'leaderboard.title',
    defaultMessage: 'Leaderboard',
  },
  'leaderboard.loading': {
    id: 'leaderboard.loading',
    defaultMessage: 'Loading leaderboard...',
  },
  'leaderboard.description': {
    id: 'leaderboard.description',
    defaultMessage:
      'Ranking is based on total points. If multiple learners have the same points, ranking is determined by who completed earlier. The Top 10 includes the first 10 learners based on this criteria.',
  },
  'leaderboard.noData': {
    id: 'leaderboard.noData',
    defaultMessage: 'No leaderboard data available.',
  },
  'leaderboard.rank': {
    id: 'leaderboard.rank',
    defaultMessage: 'Rank',
  },
  'leaderboard.student': {
    id: 'leaderboard.student',
    defaultMessage: 'Student',
  },
  'leaderboard.points': {
    id: 'leaderboard.points',
    defaultMessage: 'Points',
  },
  'leaderboard.you': {
    id: 'leaderboard.you',
    defaultMessage: '(You)',
  },
  'leaderboard.yourPosition': {
    id: 'leaderboard.yourPosition',
    defaultMessage: 'Your Position',
  },
  'leaderboard.top10Message': {
    id: 'leaderboard.top10Message',
    defaultMessage:
      'You are currently in the Top 10. Keep maintaining your performance.',
  },
  'leaderboard.improveMessage': {
    id: 'leaderboard.improveMessage',
    defaultMessage:
      'Keep improving your score to climb the leaderboard.',
  },
});

export default messages;
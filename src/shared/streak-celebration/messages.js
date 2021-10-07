import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  congratulations: {
    id: 'learning.streakCelebration.congratulations',
    defaultMessage: 'Congratulations!',
  },
  streakBody: {
    id: 'learning.streakCelebration.body',
    defaultMessage: 'Keep it up, you’re on a roll!',
  },
  streakButton: {
    id: 'learning.streakCelebration.button',
    defaultMessage: 'Keep it up',
  },
  streakButtonSrOnly: {
    id: 'learning.streakCelebration.buttonSrOnly',
    defaultMessage: 'Close modal and continue',
    description: 'Screenreader label for streakButton text',
  },
  streakButtonAA759: {
    id: 'learning.streakCelebration.buttonAA759',
    defaultMessage: 'Continue with course',
  },
  streakHeader: {
    id: 'learning.streakCelebration.header',
    defaultMessage: 'day streak',
    description: 'Will come after a number. For example, 3 day streak',
  },
  streakFactoidABoldedSection: {
    id: 'learning.streakCelebration.factoidABoldedSection',
    defaultMessage: 'are 20x more likely to pass their course',
    description: 'This bolded section is in the following sentence: Users who learn 3 days in a row {bolded_section} than those who don\'t.',
  },
  streakFactoidBBoldedSection: {
    id: 'learning.streakCelebration.factoidBBoldedSection',
    defaultMessage: 'complete 5x as much course content on average',
    description: 'This bolded section is in the following sentence: Users who learn 3 days in a row {bolded_section} vs. those who don\'t.',
  },
  streakDiscountMessage: {
    id: 'learning.streakCelebration.streakDiscountMessage',
    defaultMessage: 'You’ve unlocked a 15% off discount when you upgrade this course for a limited time only.',
    description: 'This message describes a discount the user becomes eligible for when they hit their three day streak',
  },
});

export default messages;

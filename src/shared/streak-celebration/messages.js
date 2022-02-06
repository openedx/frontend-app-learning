import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  congratulations: {
    id: 'learning.streakCelebration.congratulations',
    defaultMessage: 'Congratulations!',
    description: 'Shown to learners when are using the learning app for X days in a row',
  },
  streakBody: {
    id: 'learning.streakCelebration.body',
    defaultMessage: 'Keep it up, you’re on a roll!',
  },
  streakButton: {
    id: 'learning.streakCelebration.button',
    defaultMessage: 'Keep it up',
    description: 'Text on the button which closes the celebration dialog',
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
    defaultMessage: 'You’ve unlocked a {percent}% off discount when you upgrade this course for a limited time only.',
    description: 'This message describes a discount the user becomes eligible for when they hit their three day streak',
  },
});

export default messages;

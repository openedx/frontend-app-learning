import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  suggestedSchedule: {
    id: 'datesBanner.suggestedSchedule',
    defaultMessage: 'We’ve built a suggested schedule to help you stay on track. But don’t worry—it’s flexible so you'
      + ' can learn at your own pace.',
  },
  upgradeToCompleteHeader: {
    id: 'datesBanner.upgradeToCompleteGradedBanner.header',
    defaultMessage: 'Upgrade to unlock',
    description: 'Messaging that prompts users to upgrade their course status in order to access locked course content',
  },
  upgradeToCompleteBody: {
    id: 'datesBanner.upgradeToCompleteGradedBanner.body',
    defaultMessage: 'You are auditing this course, which means that you are unable to participate in graded'
      + ' assignments. To complete graded assignments as part of this course, you can upgrade today.',
  },
  upgradeToCompleteButton: {
    id: 'datesBanner.upgradeToCompleteGradedBanner.button',
    defaultMessage: 'Upgrade now',
    description: 'Button that prompts users to upgrade their course status',
  },
  upgradeToShiftBody: {
    id: 'datesBanner.upgradeToResetBanner.body',
    defaultMessage: 'To keep yourself on track, you can update this schedule and shift the past due assignments into'
      + ' the future. Don’t worry—you won’t lose any of the progress you’ve made when you shift your due dates.',
  },
  upgradeToShiftButton: {
    id: 'datesBanner.upgradeToResetBanner.button',
    defaultMessage: 'Upgrade to shift due dates',
    description: 'Button that prompts users to upgrade their course status before they can shift their due dates into'
      + ' the future',
  },
  missedDeadlines: {
    id: 'datesBanner.resetDatesBanner.header',
    defaultMessage: 'It looks like you missed some important deadlines based on our suggested schedule.',
  },
  shiftDatesBody: {
    id: 'datesBanner.resetDatesBanner.body',
    defaultMessage: 'To keep yourself on track, you can update this schedule and shift the past due assignments into'
      + ' the future. Don’t worry—you won’t lose any of the progress you’ve made when you shift your due dates.',
  },
  shiftDatesButton: {
    id: 'datesBanner.resetDatesBanner.button',
    defaultMessage: 'Shift due dates',
    description: 'Button that prompts users to move their due dates into the future',
  },
});

export default messages;

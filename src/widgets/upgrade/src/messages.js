import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  upgradePanel: {
    id: 'upgrade.container',
    defaultMessage: 'Upgrade panel',
    description: 'Upgrade panel container label for accessibility',
  },
  openUpgradeTrigger: {
    id: 'upgrade.open.button',
    defaultMessage: 'Show upgrade panel',
    description: 'Button to open the upgrade panel',
  },
  closeUpgradeTrigger: {
    id: 'upgrade.close.button',
    defaultMessage: 'Close upgrade panel',
    description: 'Button for the learner to close the upgrade panel',
  },
  responsiveCloseUpgradePanel: {
    id: 'upgrade.responsive.close.button',
    defaultMessage: 'Back to course',
    description: 'Responsive button to go back to course and close the upgrade panel',
  },
  upgradeTitle: {
    id: 'upgrade.title',
    defaultMessage: 'Upgrade',
    description: 'Title text displayed for the upgrade/upgrade panel',
  },
  noUpgradeMessage: {
    id: 'upgrade.no.message',
    defaultMessage: 'No upgrade options available.',
    description: 'Text displayed when there are no upgrade options for the learner',
  },
});

export default messages;

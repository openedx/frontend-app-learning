import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.lockPaywall.title': {
    id: 'learn.lockPaywall.title',
    defaultMessage: 'Graded assignments are locked',
    description: 'Heading for message shown to indicate that a piece of content is unavailable to audit track users.',
  },
  'learn.lockPaywall.content': {
    id: 'learn.lockPaywall.content',
    defaultMessage: 'Upgrade to gain access to locked features like this one and get the most out of your course.',
    description: 'Message shown to indicate that a piece of content is unavailable to audit track users.',
  },
  'learn.lockPaywall.upgrade.link': {
    id: 'learn.lockPaywall.upgrade.link',
    defaultMessage: 'Upgrade for ({currencySymbol}{price})',
    description: 'A link users can click that navigates their browser to the upgrade payment page.',
  },
  'learn.lockPaywall.example.alt': {
    id: 'learn.lockPaywall.example.alt',
    defaultMessage: 'Example Certificate',
    description: 'Alternate text displayed when the example certificate image cannot be displayed.',
  },
});

export default messages;

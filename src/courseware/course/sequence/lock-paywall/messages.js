import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.lockPaywall.title': {
    id: 'learn.lockPaywall.title',
    defaultMessage: 'Verified Track Access',
    description: 'Heading for message shown to indicate that a piece of content is unavailable to audit track users.',
  },
  'learn.lockPaywall.content': {
    id: 'learn.lockPaywall.content',
    defaultMessage: 'Graded assessments are available to Verified Track learners.',
    description: 'Message shown to indicate that a piece of content is unavailable to audit track users.',
  },
  'learn.lockPaywall.upgrade.link': {
    id: 'learn.lockPaywall.upgrade.link',
    defaultMessage: 'Upgrade to unlock ({currencySymbol}{price})',
    description: 'A link users can click that navigates their browser to the upgrade payment page.',
  },
  'learn.lockPaywall.example.alt': {
    id: 'learn.lockPaywall.example.alt',
    defaultMessage: 'Example Certificate',
    description: 'Alternate text displayed when the example certificate image cannot be displayed.',
  },
});

export default messages;

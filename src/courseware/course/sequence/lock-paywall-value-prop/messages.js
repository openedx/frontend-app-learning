import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.lockPaywall.upgrade.link.text': {
    id: 'learn.lockPaywall.upgrade.link.text',
    defaultMessage: 'Upgrade for {currencySymbol}{price}',
    description: 'A link users can click that navigates their browser to the upgrade payment page.',
  },
  'learn.lockPaywall.upgrade.link.strikethrough.price': {
    id: 'learn.lockPaywall.upgrade.link.strikethrough.price',
    defaultMessage: '{currencySymbol}{price}',
  },
  'learn.lockPaywall.example.alt': {
    id: 'learn.lockPaywall.example.alt',
    defaultMessage: 'Example Certificate',
  },
  'lock.title': {
    id: 'lock.title',
    defaultMessage: 'Graded assignments are locked',
  },
  'lock.title.text': {
    id: 'lock.title.text',
    defaultMessage: 'Upgrade to gain access to locked features like this one and get the most out of your course.',
  },
  'lock.description.start': {
    id: 'lock.description.start',
    defaultMessage: 'When you upgrade, you:',
  },
  'lock.description.reason1.linkText': {
    id: 'lock.description.reason1.linkText',
    defaultMessage: 'verified certificate',
  },
  'lock.description.reason2': {
    id: 'lock.description.reason2',
    defaultMessage: 'Unlock access to all course activities, including ',
  },
  'lock.description.reason2.highlight': {
    id: 'lock.description.reason2.highlight',
    defaultMessage: 'graded assignments',
  },
  'lock.description.reason3': {
    id: 'lock.description.reason3',
    defaultMessage: ' to course content and materials, even after the course ends',
  },
  'lock.description.reason3.highlight': {
    id: 'lock.description.reason3.highlight',
    defaultMessage: 'Full access',
  },
  'lock.description.reason4.beginning': {
    id: 'lock.description.reason4.beginning',
    defaultMessage: 'Support our ',
  },
  'lock.description.reason4.highlight': {
    id: 'lock.description.reason4.highlight',
    defaultMessage: 'non-profit mission',
  },
  'lock.description.reason4.end': {
    id: 'lock.description.reason4.end',
    defaultMessage: ' at edX',
  },
});

export default messages;

import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.course.license.allRightsReserved.text': {
    id: 'learn.course.license.allRightsReserved.text',
    defaultMessage: 'All Rights Reserved',
    description: 'License text shown when using All Rights Reserved license type.',
  },
  'learn.course.license.creativeCommons.terms.preamble': {
    id: 'learn.course.license.creativeCommons.terms.preamble',
    defaultMessage: 'Creative Commons licensed content, with terms as follows:',
    description: 'Screen reader only text preamble before reading specific Creative Commons license terms.',
  },
  'learn.course.license.creativeCommons.terms.by': {
    id: 'learn.course.license.creativeCommons.terms.by',
    defaultMessage: 'Attribution',
    description: 'Creative Commons license text for Attribution term.',
  },
  'learn.course.license.creativeCommons.terms.nc': {
    id: 'learn.course.license.creativeCommons.terms.nc',
    defaultMessage: 'Noncommercial',
    description: 'Creative Commons license text for Noncommercial term.',
  },
  'learn.course.license.creativeCommons.terms.nd': {
    id: 'learn.course.license.creativeCommons.terms.nd',
    defaultMessage: 'No Derivatives',
    description: 'Creative Commons license text for No Derivatives term.',
  },
  'learn.course.license.creativeCommons.terms.sa': {
    id: 'learn.course.license.creativeCommons.terms.sa',
    defaultMessage: 'Share Alike',
    description: 'Creative Commons license text for Share Alike term.',
  },
  // No text for `zero` license
  'learn.course.license.creativeCommons.terms.zero': {
    id: 'learn.course.license.creativeCommons.terms.zero',
    defaultMessage: 'No terms',
    description: 'Creative Commons license text for license with no terms.',
  },
  'learn.course.license.creativeCommons.text': {
    id: 'learn.course.license.creativeCommons.text',
    defaultMessage: 'Some Rights Reserved',
    description: 'License text shown when using all Creative Commons license types.',
  },
});

export default messages;

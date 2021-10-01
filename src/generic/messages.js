import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  close: {
    id: 'general.altText.close',
    defaultMessage: 'Close',
    description: 'Text used as an aria-label to describe closing or dismissing a component',
  },
  registerLowercase: {
    id: 'learning.logistration.register', // ID left for historical purposes
    defaultMessage: 'register',
    description: 'Text in a link, prompting the user to create an account.  Used in "learning.logistration.alert"',
  },
  registerSentenceCase: {
    id: 'general.register.sentenceCase',
    defaultMessage: 'Register',
    description: 'Text in a button, prompting the user to register.',
  },
  signInLowercase: {
    id: 'learning.logistration.login', // ID left for historical purposes
    defaultMessage: 'sign in',
    description: 'Text in a link, prompting the user to log in.  Used in "learning.logistration.alert"',
  },
  signInSentenceCase: {
    id: 'general.signIn.sentenceCase',
    defaultMessage: 'Sign in',
    description: 'Text in a button, prompting the user to log in.',
  },
  'upsell.fullAccessBullet': {
    id: 'learning.generic.upsell.fullAccessBullet',
    defaultMessage: '{fullAccess} to course content and materials, even after the course ends',
    description: 'Bullet showcasing upgrade lifts access durations.',
  },
  'upsell.fullAccessBullet.fullAccess': {
    id: 'learning.generic.upsell.fullAccessBullet.fullAccess',
    defaultMessage: 'Full access',
    description: 'Bolded phrase "full access".',
  },
  'upsell.supportMissionBullet': {
    id: 'learning.generic.upsell.supportMissionBullet',
    defaultMessage: 'Support our {mission} at edX',
    description: 'Bullet encouraging user to support edX.',
  },
  'upsell.supportMissionBullet.mission': {
    id: 'learning.generic.upsell.supportMissionBullet.mission',
    defaultMessage: 'mission',
    description: 'Bolded word "mission".',
  },
  'upsell.unlockGradedBullet': {
    id: 'learning.generic.upsell.unlockGradedBullet',
    defaultMessage: 'Unlock your access to all course activities, including {gradedAssignments}',
    description: 'Bullet showcasing benefit of additional course material.',
  },
  'upsell.unlockGradedBullet.gradedAssignments': {
    id: 'learning.generic.upsell.unlockGradedBullet.gradedAssignments',
    defaultMessage: 'graded assignments',
    description: 'Bolded name of unlocked feature with upgrade.',
  },
  'upsell.verifiedCertMessageBullet': {
    id: 'learning.generic.upsell.verifiedCertMessageBullet',
    defaultMessage: 'Earn a {verifiedCert} of completion to showcase on your resumé',
    description: 'Bullet showcasing benefit of earned credential.',
  },
  'upsell.verifiedCertMessageBullet.verifiedCert': {
    id: 'learning.generic.upsell.verifiedCertMessageBullet.verifiedCert',
    defaultMessage: 'verified certificate',
    description: 'Bolded name of credential the learner receieves.',
  },
});

export default messages;

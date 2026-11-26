import { App } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import provides from '@src/provides';
import routes from '@src/routes';
import slots from '@src/slots';

const app: App = {
  appId,
  // Every key Learning reads, with its default: the README lists the same keys, and a test holds the two together.
  defaultConfig: {
    CONTACT_URL: null,
    CREDENTIALS_BASE_URL: null,
    CREDIT_HELP_LINK_URL: null,
    DISCOUNT_CODE_INFO_URL: null,
    DISCOVERY_API_BASE_URL: null,
    ECOMMERCE_BASE_URL: null,
    ENABLE_NOTICES: null,
    ENTERPRISE_LEARNER_PORTAL_URL: null,
    EXAMS_BASE_URL: null,
    LEGACY_THEME_NAME: null,
    MARKETING_SITE_BASE_URL: null,
    PROCTORED_EXAM_FAQ_URL: null,
    PROCTORED_EXAM_RULES_URL: null,
    SESSION_COOKIE_DOMAIN: null,
    SHOW_UNGRADED_ASSIGNMENT_PROGRESS: false,
    SOCIAL_UTM_MILESTONE_CAMPAIGN: null,
    SUPPORT_URL: null,
    SUPPORT_URL_CALCULATOR_MATH: null,
    SUPPORT_URL_ID_VERIFICATION: null,
    SUPPORT_URL_VERIFIED_CERTIFICATE: null,
    TERMS_OF_SERVICE_URL: null,
    TWITTER_HASHTAG: null,
    TWITTER_URL: null,
  },
  routes,
  provides,
  slots,
};

export default app;

import { EnvironmentTypes, SiteConfig } from '@openedx/frontend-base';

const siteConfig: SiteConfig = {
  siteId: 'learning-test-site',
  siteName: 'Learning Test Site',
  baseUrl: 'http://localhost:2000',
  lmsBaseUrl: 'http://localhost:18000',
  loginUrl: 'http://localhost:18000/login',
  logoutUrl: 'http://localhost:18000/logout',

  environment: EnvironmentTypes?.TEST ?? 'test',
  apps: [{
    appId: 'org.openedx.frontend.app.learning',
    config: {
      CREDIT_HELP_LINK_URL: 'https://help.edx.org/edxlearner/s/article/Can-I-receive-college-credit-or-credit-hours-for-my-course',
      EXAMS_BASE_URL: 'http://localhost:18740',
      SUPPORT_URL_ID_VERIFICATION: 'https://support.edx.org/hc/en-us/articles/206503858-How-do-I-verify-my-identity',
    },
  }],
};

export default siteConfig;

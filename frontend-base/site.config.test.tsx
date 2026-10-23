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
      EXAMS_BASE_URL: 'http://localhost:18740',
    },
  }],
};

export default siteConfig;

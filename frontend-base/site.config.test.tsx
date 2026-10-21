import { EnvironmentTypes, SiteConfig } from '@openedx/frontend-base';

const siteConfig: SiteConfig = {
  siteId: 'learning-test-site',
  siteName: 'Learning Test Site',
  baseUrl: 'http://localhost:8080',
  lmsBaseUrl: 'http://localhost:8000',
  loginUrl: 'http://localhost:8000/login',
  logoutUrl: 'http://localhost:8000/logout',

  environment: EnvironmentTypes?.TEST ?? 'test',
  apps: [{
    appId: 'org.openedx.frontend.app.learning',
  }],
};

export default siteConfig;

import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';

import { learningApp } from './src';

import '@openedx/frontend-base/shell/style';

const siteConfig: SiteConfig = {
  siteId: 'learning-dev',
  siteName: 'Learning Dev',
  baseUrl: 'http://apps.local.openedx.io:2000',
  lmsBaseUrl: 'http://local.openedx.io:8000',
  cmsBaseUrl: 'http://studio.local.openedx.io:8001',
  loginUrl: 'http://local.openedx.io:8000/login',
  logoutUrl: 'http://local.openedx.io:8000/logout',

  environment: EnvironmentTypes.DEVELOPMENT,
  apps: [
    shellApp,
    headerApp,
    footerApp,
    learningApp,
  ],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
};

export default siteConfig;

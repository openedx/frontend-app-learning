import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';

import { templateApp } from './src';

import '@openedx/frontend-base/shell/style';

const siteConfig: SiteConfig = {
  siteId: 'template-ci',
  siteName: 'Template CI',
  baseUrl: 'http://apps.local.openedx.io',
  lmsBaseUrl: 'http://local.openedx.io',
  loginUrl: 'http://local.openedx.io/login',
  logoutUrl: 'http://local.openedx.io/logout',

  environment: EnvironmentTypes.PRODUCTION,
  apps: [
    shellApp,
    headerApp,
    footerApp,
    templateApp,
  ],
};

export default siteConfig;

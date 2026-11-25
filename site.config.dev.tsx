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
  // The other apps Learning links to, where Tutor's development mode serves them.
  externalRoutes: [
    {
      role: 'org.openedx.frontend.role.dashboard',
      url: 'http://apps.local.openedx.io:1996/learner-dashboard/',
    },
    {
      role: 'org.openedx.frontend.role.profile',
      url: 'http://apps.local.openedx.io:1995/profile/',
    },
    {
      role: 'org.openedx.frontend.role.account',
      url: 'http://apps.local.openedx.io:1997/account/',
    },
    {
      role: 'org.openedx.frontend.role.courses',
      url: 'http://apps.local.openedx.io:1998/catalog/courses',
    },
    {
      role: 'org.openedx.frontend.role.discussions',
      url: 'http://apps.local.openedx.io:2002/discussions',
    },
    {
      role: 'org.openedx.frontend.role.logout',
      url: 'http://local.openedx.io:8000/logout',
    },
  ],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
};

export default siteConfig;

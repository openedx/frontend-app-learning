import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { configure as configureI18n } from '@edx/frontend-platform/i18n';
import { configure as configureLogging } from '@edx/frontend-platform/logging';
import { configure as configureAuth, MockAuthService } from '@edx/frontend-platform/auth';

import appMessages from './i18n';

class MockLoggingService {
  logInfo = jest.fn();

  logError = jest.fn();
}

export default function initializeMockApp() {
  mergeConfig({
    INSIGHTS_BASE_URL: process.env.INSIGHTS_BASE_URL || null,
    STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
    authenticatedUser: {
      userId: 'abc123',
      username: 'Mock User',
      roles: [],
      administrator: false,
    },
  });

  const loggingService = configureLogging(MockLoggingService, {
    config: getConfig(),
  });
  const authService = configureAuth(MockAuthService, {
    config: getConfig(),
    loggingService,
  });

  // i18n doesn't have a service class to return.
  configureI18n({
    config: getConfig(),
    loggingService,
    messages: [appMessages],
  });

  return { loggingService, authService };
}

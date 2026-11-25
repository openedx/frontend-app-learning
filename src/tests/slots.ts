import {
  type App, getSiteConfig, setSiteConfig, type SiteConfig, type SlotOperation,
} from '@openedx/frontend-base';

// The site config as it was before the current test added any apps.
let originalSiteConfig: SiteConfig | undefined;
let appCount = 0;

/*
 * Installs an app for the current test only, the way a plugin arrives: appended to the site config's `apps`, with
 * its own slot operations and providers. Call it in a test or a `beforeEach`, before rendering. Every call adds
 * another app; all of them go after the test. The render helpers in `./render` mount the apps' providers.
 *
 * `setSiteConfig` and not `mergeSiteConfig`: the latter deep-clones the config and cannot take an app out again,
 * while restoring the exact object that was there before is one call.
 */
export function addTestApp(app: Omit<App, 'appId'>) {
  const siteConfig = getSiteConfig();
  originalSiteConfig ??= siteConfig;
  appCount += 1;
  setSiteConfig({
    ...siteConfig,
    apps: [...(siteConfig.apps ?? []), { appId: `org.openedx.frontend.app.learning.test${appCount}`, ...app }],
  });
}

// Points `role` at an external URL for the current test only, as a site's `externalRoutes` would.
export function addExternalRoute(role: string, url: string) {
  const siteConfig = getSiteConfig();
  originalSiteConfig ??= siteConfig;
  setSiteConfig({
    ...siteConfig,
    externalRoutes: [...(siteConfig.externalRoutes ?? []), { role, url }],
  });
}

// Installs slot operations for the current test only, as the `slots` of an app of their own.
export function addSlotOperations(slots: SlotOperation[]) {
  addTestApp({ slots });
}

export function removeSlotOperations() {
  if (originalSiteConfig) {
    setSiteConfig(originalSiteConfig);
    originalSiteConfig = undefined;
  }
}

// Registered by importing this module, so no test file has to remember it.
afterEach(removeSlotOperations);

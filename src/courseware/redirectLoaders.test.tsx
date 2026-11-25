import {
  getSiteConfig, mergeAppConfig, mergeSiteConfig, type RoleRouteObject, setSiteConfig,
} from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import { appId, dashboardRole } from '@src/constants';
import routes from '@src/routes';
import { mockLocation } from '@src/tests/location';
import { renderRoutes } from '@src/tests/render';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const siteConfig = getSiteConfig();
const { lmsBaseUrl } = siteConfig;
const dashboardUrl = 'http://localhost:18000/dashboard';
const portalUrl = 'http://localhost:8734';

const findRoute = (tree: RoleRouteObject[], id: string): RoleRouteObject | undefined => {
  for (const route of tree) {
    if (route.id === id) {
      return route;
    }
    const found = route.children && findRoute(route.children as RoleRouteObject[], id);
    if (found) {
      return found;
    }
  }
  return undefined;
};

// The redirect route from the route array, under Learning's path, with anywhere else rendering where the router is.
const redirectRoute = findRoute(routes, 'org.openedx.frontend.route.learning.redirect')!;
const LandingProbe = () => <span data-testid="landing">{useLocation().pathname}</span>;
const renderAt = (path: string) => renderRoutes([
  { path: 'learning', children: [redirectRoute] },
  { path: '*', element: <LandingProbe /> },
], `/learning/redirect/${path}`);

const landingPathname = async (path: string) => {
  renderAt(path);
  return (await screen.findByTestId('landing')).textContent;
};

// A redirect to another origin is a document load, which the router hands to the browser.
const expectDocumentLoad = async (path: string, url: string) => {
  const { assign } = mockLocation({ assign: jest.fn() });
  renderAt(path);
  await waitFor(() => expect(assign).toHaveBeenCalledWith(url));
};

const declareAppRoute = (role: string, path: string) => mergeSiteConfig({
  apps: [{ appId: `org.openedx.frontend.app.test.${path}`, routes: [{ path, handle: { roles: [role] } }] }],
});
const declareExternalRoute = (role: string, url: string) => mergeSiteConfig({ externalRoutes: [{ role, url }] });

afterEach(() => {
  setSiteConfig(siteConfig);
  mergeAppConfig(appId, { ENTERPRISE_LEARNER_PORTAL_URL: null });
});

describe('course access redirects', () => {
  describe('dashboard', () => {
    it('goes to the installed app that provides the dashboard role', async () => {
      declareAppRoute(dashboardRole, 'learner-dashboard');
      expect(await landingPathname('dashboard')).toBe('/learner-dashboard');
    });

    it('goes to the external route the site declares for the dashboard role', async () => {
      declareExternalRoute(dashboardRole, dashboardUrl);
      await expectDocumentLoad('dashboard', dashboardUrl);
    });

    it("goes to the site's home when nothing provides the dashboard role", async () => {
      expect(await landingPathname('dashboard')).toBe('/');
    });
  });

  describe('enterprise-learner-dashboard', () => {
    it('goes to ENTERPRISE_LEARNER_PORTAL_URL', async () => {
      mergeAppConfig(appId, { ENTERPRISE_LEARNER_PORTAL_URL: portalUrl });
      await expectDocumentLoad('enterprise-learner-dashboard', portalUrl);
    });

    it('falls back to the dashboard redirect when ENTERPRISE_LEARNER_PORTAL_URL is unset', async () => {
      declareExternalRoute(dashboardRole, dashboardUrl);
      await expectDocumentLoad('enterprise-learner-dashboard', dashboardUrl);
    });
  });

  describe('survey', () => {
    it.each([
      ['an unencoded', courseId],
      ['a twice-encoded', encodeURIComponent(encodeURIComponent(courseId))],
    ])('goes to the LMS survey for %s course id', async (_, spelling) => {
      await expectDocumentLoad(`survey/${spelling}`, `${lmsBaseUrl}/courses/${courseId}/survey`);
    });
  });

  describe('consent', () => {
    it('goes to the LMS path in consentPath', async () => {
      const consentPath = '/grant_data_sharing_permissions?course_id=abc';
      await expectDocumentLoad(`consent?consentPath=${encodeURIComponent(consentPath)}`, `${lmsBaseUrl}${consentPath}`);
    });

    it('goes to the LMS root with no consentPath', async () => {
      await expectDocumentLoad('consent', lmsBaseUrl);
    });

    it.each([
      '.evil.example/',
      '@evil.example/',
      '//evil.example/',
      'https://evil.example/',
    ])('goes to the LMS root when consentPath is %s, which is not a path', async (consentPath) => {
      await expectDocumentLoad(`consent?consentPath=${encodeURIComponent(consentPath)}`, lmsBaseUrl);
    });
  });

  describe('home', () => {
    it.each([
      ['an unencoded', courseId],
      ['a twice-encoded', encodeURIComponent(encodeURIComponent(courseId))],
    ])('goes to the course home, in the client, for %s course id', async (_, spelling) => {
      expect(await landingPathname(`home/${spelling}`)).toBe(`/learning/course/${courseId}/home`);
    });
  });
});

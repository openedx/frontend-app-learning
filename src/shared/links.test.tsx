import {
  getAppConfig, getSiteConfig, mergeAppConfig, mergeSiteConfig, setSiteConfig,
} from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { appId, dashboardRole, profileRole } from '@src/constants';
import { authenticatedUser } from '@src/tests/authenticatedUser';
import { render } from '@src/tests/render';
import { DashboardLink, IdVerificationSupportLink, ProfileLink } from './links';

const siteConfig = getSiteConfig();
const supportUrl = getAppConfig(appId).SUPPORT_URL_ID_VERIFICATION;

const declareAppRoute = (role: string, path: string) => mergeSiteConfig({
  apps: [{ appId: `org.openedx.frontend.app.test.${path}`, routes: [{ path, handle: { roles: [role] } }] }],
});
const declareExternalRoute = (role: string, url: string) => mergeSiteConfig({ externalRoutes: [{ role, url }] });

afterEach(() => {
  setSiteConfig(siteConfig);
  mergeAppConfig(appId, { SUPPORT_URL_ID_VERIFICATION: supportUrl });
});

describe('DashboardLink', () => {
  it('links to the app route that declares the dashboard role', () => {
    declareAppRoute(dashboardRole, 'learner-dashboard');
    render(<DashboardLink />, { wrapWithRouter: true });

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/learner-dashboard');
  });

  it('links to the external route the site declares for the dashboard role', () => {
    declareExternalRoute(dashboardRole, 'http://localhost:18000/dashboard');
    render(<DashboardLink />, { wrapWithRouter: true });

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', 'http://localhost:18000/dashboard');
  });

  it('renders nothing when the site declares no route for the dashboard role', () => {
    const { container } = render(<DashboardLink />, { wrapWithRouter: true });

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ProfileLink', () => {
  it('links to the authenticated user under the app route that declares the profile role', () => {
    declareAppRoute(profileRole, 'profile');
    render(<ProfileLink />, { wrapWithRouter: true });

    expect(screen.getByRole('link', { name: 'Profile' }))
      .toHaveAttribute('href', `/profile/u/${authenticatedUser.username}`);
  });

  it('links to the authenticated user under the external route the site declares for the profile role', () => {
    declareExternalRoute(profileRole, 'http://localhost:1995/profile/');
    render(<ProfileLink />, { wrapWithRouter: true });

    expect(screen.getByRole('link', { name: 'Profile' }))
      .toHaveAttribute('href', `http://localhost:1995/profile/u/${authenticatedUser.username}`);
  });

  it('renders nothing when the site declares no route for the profile role', () => {
    const { container } = render(<ProfileLink />, { wrapWithRouter: true });

    expect(container).toBeEmptyDOMElement();
  });
});

describe('IdVerificationSupportLink', () => {
  it('links to SUPPORT_URL_ID_VERIFICATION from the app config', () => {
    mergeAppConfig(appId, { SUPPORT_URL_ID_VERIFICATION: 'http://localhost/id-verification' });
    render(<IdVerificationSupportLink />);

    expect(screen.getByRole('link', { name: 'Learn more about ID verification' }))
      .toHaveAttribute('href', 'http://localhost/id-verification');
  });

  it('renders nothing when SUPPORT_URL_ID_VERIFICATION is null', () => {
    mergeAppConfig(appId, { SUPPORT_URL_ID_VERIFICATION: null });
    const { container } = render(<IdVerificationSupportLink />);

    expect(container).toBeEmptyDOMElement();
  });
});

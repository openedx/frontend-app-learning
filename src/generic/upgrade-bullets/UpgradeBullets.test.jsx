import { getSiteConfig, mergeAppConfig } from '@openedx/frontend-base';
import { act, screen } from '@testing-library/react';

import { appId } from '@src/constants';
import { render } from '@src/tests/render';

import {
  VerifiedCertBullet,
  UnlockGradedBullet,
  FullAccessBullet,
  SupportMissionBullet,
} from './UpgradeBullets';

describe('UpgradeBullets', () => {
  const bullets = (
    <ul>
      <VerifiedCertBullet />
      <UnlockGradedBullet />
      <FullAccessBullet />
      <SupportMissionBullet />
    </ul>
  );

  afterEach(() => {
    act(() => mergeAppConfig(appId, { MARKETING_SITE_BASE_URL: null }));
  });

  it('upgrade bullet text properly rendered', async () => {
    mergeAppConfig(appId, { MARKETING_SITE_BASE_URL: 'https://marketing.example.com' });
    render(bullets);
    expect(screen.getByText(/Earn a.*?of completion to showcase on your resumé/s).textContent).toMatch('Earn a verified certificate (learn more in a new tab) of completion to showcase on your resumé');
    expect(screen.getByText(/Unlock your access/s).textContent).toMatch('Unlock your access to all course activities, including graded assignments');
    expect(screen.getByText(/to course content and materials/s).textContent).toMatch('Full access to course content and materials, even after the course ends');
    expect(screen.getByText(/Support our.*?at /s).textContent).toMatch(`Support our mission at ${getSiteConfig().siteName}`);
  });

  it('links the verified certificate to the marketing site when the site has one', () => {
    mergeAppConfig(appId, { MARKETING_SITE_BASE_URL: 'https://marketing.example.com' });
    render(bullets);

    expect(screen.getByRole('link', { name: /verified certificate/ }))
      .toHaveAttribute('href', 'https://marketing.example.com/verified-certificate');
  });

  it('names the verified certificate without a link when the site has no marketing site', () => {
    render(bullets);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/Earn a.*?of completion to showcase on your resumé/s).textContent)
      .toMatch('Earn a verified certificate of completion to showcase on your resumé');
  });
});

import React from 'react';

import {
  initializeMockApp,
  render,
  screen,
} from '../../setupTest';

import {
  VerifiedCertBullet,
  UnlockGradedBullet,
  FullAccessBullet,
  SupportMissionBullet,
} from './UpsellBullets';

initializeMockApp();

describe('UpsellBullets', () => {
  const bullets = (
    <>
      <VerifiedCertBullet />
      <UnlockGradedBullet />
      <FullAccessBullet />
      <SupportMissionBullet />
    </>
  );

  it('upsell bullet text properly rendered', async () => {
    render(bullets);
    expect(screen.getByText(/Earn a.*?of completion to showcase on your resumé/s).textContent).toMatch('Earn a verified certificate of completion to showcase on your resumé');
    expect(screen.getByText(/Unlock your access/s).textContent).toMatch('Unlock your access to all course activities, including graded assignments');
    expect(screen.getByText(/to course content and materials/s).textContent).toMatch('Full access to course content and materials, even after the course ends');
    expect(screen.getByText(/Support our.*?at edX/s).textContent).toMatch('Support our mission at edX');
  });
});

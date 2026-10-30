import React from 'react';
import { getLoginRedirectUrl, getSiteConfig } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import LogistrationAlert from './LogistrationAlert';

describe('LogistrationAlert', () => {
  it('asks the learner to sign in or register, each link returning to this page', () => {
    render(<LogistrationAlert />);

    expect(screen.getByRole('alert')).toHaveTextContent('To see course content, sign in or register.');
    expect(screen.getByRole('link', { name: 'sign in' })).toHaveAttribute('href', getLoginRedirectUrl(window.location.href));
    expect(screen.getByRole('link', { name: 'register' })).toHaveAttribute(
      'href',
      `${getSiteConfig().lmsBaseUrl}/register?next=${encodeURIComponent(window.location.href)}`,
    );
  });
});

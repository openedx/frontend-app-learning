import { getAuthenticatedHttpClient, getSiteConfig, mergeAppConfig } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

import { appId } from '@src/constants';
import { authenticatedUser } from '@src/tests/authenticatedUser';
import { render } from '@src/tests/render';
import AccountActivationAlert from './AccountActivationAlert';

const cookieName = 'show-account-activation-popup';
const title = 'Activate your account so you can log back in';
const resendUrl = `${getSiteConfig().lmsBaseUrl}/api/send_account_activation_email`;

const setCookie = () => {
  document.cookie = `${cookieName}=true; path=/`;
};
const clearCookie = () => {
  document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

describe('AccountActivationAlert', () => {
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    clearCookie();
    // mergeAppConfig cannot remove a key; js-cookie leaves a null domain out, as it does an unset one.
    mergeAppConfig(appId, { SESSION_COOKIE_DOMAIN: null });
  });

  it('opens when the cookie is set, and removes the cookie', () => {
    setCookie();
    render(<AccountActivationAlert />);

    const dialog = screen.getByRole('dialog', { name: title });
    expect(dialog).toHaveTextContent(`We sent an email to ${authenticatedUser.email} with a link to activate your account.`);
    expect(document.cookie).not.toContain(cookieName);
  });

  it('stays closed without the cookie', () => {
    render(<AccountActivationAlert />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes the cookie on the domain the app config names, and stays closed while the cookie remains', () => {
    mergeAppConfig(appId, { SESSION_COOKIE_DOMAIN: '.other.example.com' });
    const writeCookie = jest.spyOn(Document.prototype, 'cookie', 'set');
    setCookie();
    render(<AccountActivationAlert />);

    expect(writeCookie).toHaveBeenLastCalledWith(expect.stringContaining('; domain=.other.example.com'));
    expect(document.cookie).toContain(cookieName);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    writeCookie.mockRestore();
  });

  it('closes on the continue button, which names the site', async () => {
    setCookie();
    render(<AccountActivationAlert />);
    await userEvent.click(screen.getByRole('button', { name: `Continue to ${getSiteConfig().siteName}` }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('stays open on Escape', async () => {
    setCookie();
    render(<AccountActivationAlert />);
    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('dialog', { name: title })).toBeInTheDocument();
  });

  it('resends the activation email, with a spinner until the request settles and a check after', async () => {
    let settle: (response: [number, object]) => void = () => {};
    axiosMock.onPost(resendUrl).reply(() => new Promise((resolve) => {
      settle = resolve;
    }));
    setCookie();
    render(<AccountActivationAlert />);
    const dialog = screen.getByRole('dialog', { name: title });
    await userEvent.click(screen.getByRole('button', { name: 'resend the email' }));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(dialog.querySelector('.spinner-border')).toBeInTheDocument();
    expect(dialog.querySelector('.text-success-500')).not.toBeInTheDocument();

    settle([200, {}]);
    await waitFor(() => expect(dialog.querySelector('.text-success-500')).toBeInTheDocument());
    expect(dialog.querySelector('.spinner-border')).not.toBeInTheDocument();
  });
});

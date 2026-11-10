import {
  getAuthenticatedHttpClient, getAuthenticatedUser, getLoggingService, getSiteConfig,
} from '@openedx/frontend-base';
import MockAdapter from 'axios-mock-adapter';

import { getNotices } from './api';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(),
}));

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
const noticesUrl = `${getSiteConfig().lmsBaseUrl}/notices/api/v1/unacknowledged`;

// frontend-base's request-error interceptor puts the status in customAttributes; the mock app's client has no interceptor.
const failWith = (httpErrorStatus) => () => Promise.reject(
  Object.assign(new Error(`Request failed with status code ${httpErrorStatus}`), { customAttributes: { httpErrorStatus } }),
);

describe('getNotices', () => {
  beforeEach(() => {
    axiosMock.reset();
    getAuthenticatedUser.mockReturnValue({ username: 'MockUser' });
  });

  it('returns the unacknowledged notices for a signed-in user', async () => {
    axiosMock.onGet(noticesUrl).reply(200, { results: ['/notices/render/1/'] });
    await expect(getNotices()).resolves.toEqual({ results: ['/notices/render/1/'] });
  });

  it('asks for nothing without a signed-in user', async () => {
    getAuthenticatedUser.mockReturnValue(null);
    await expect(getNotices()).resolves.toBeNull();
    expect(axiosMock.history.get).toHaveLength(0);
  });

  it('logs a 404 as info, since the notices plugin is not installed', async () => {
    axiosMock.onGet(noticesUrl).reply(failWith(404));
    await expect(getNotices()).resolves.toBeNull();
    expect(getLoggingService().logInfo).toHaveBeenCalledWith(
      'Error: Request failed with status code 404. This probably happened because the notices plugin is not installed on platform.',
      undefined,
    );
  });

  it('logs any other failure as an error', async () => {
    axiosMock.onGet(noticesUrl).reply(failWith(500));
    await expect(getNotices()).resolves.toBeNull();
    expect(getLoggingService().logError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Request failed with status code 500' }), undefined);
  });
});

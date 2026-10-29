import { createElement, type ReactNode } from 'react';
import { getLoggingService, MockLoggingService } from '@openedx/frontend-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

import { queryDefaults, shouldRetryQuery, useQueryErrorLogging } from './queryClient';
import { appId } from './constants';
import { NonRetryableError } from './data/http-error';

const loggingService = getLoggingService() as MockLoggingService;

describe('query error logging', () => {
  let queryClient: QueryClient;
  const listen = () => renderHook(() => useQueryErrorLogging(), {
    wrapper: ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client: queryClient }, children),
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    loggingService.logError.mockReset();
    loggingService.logInfo.mockReset();
  });

  it('reports a Learning query error through logError', async () => {
    listen();
    const error = new Error('boom');
    await queryClient.fetchQuery({
      queryKey: [appId, 'failing'],
      queryFn: () => Promise.reject(error),
    }).catch(() => {});

    expect(loggingService.logError).toHaveBeenCalledWith(error, undefined);
  });

  it('logs a status listed in `logStatusAs` at that level instead of as an error', async () => {
    listen();
    const error = Object.assign(new Error('forbidden'), { response: { status: 403 } });
    await queryClient.fetchQuery({
      queryKey: [appId, 'forbidden'],
      queryFn: () => Promise.reject(error),
      meta: { logStatusAs: { 403: 'info' } },
    }).catch(() => {});

    expect(loggingService.logInfo).toHaveBeenCalledWith(error, undefined);
    expect(loggingService.logError).not.toHaveBeenCalled();
  });

  it('does not log a status mapped to `silent`', async () => {
    listen();
    const error = Object.assign(new Error('unprocessable'), { response: { status: 422 } });
    await queryClient.fetchQuery({
      queryKey: [appId, 'maybe-unit'],
      queryFn: () => Promise.reject(error),
      meta: { logStatusAs: { 422: 'silent' } },
    }).catch(() => {});

    expect(loggingService.logError).not.toHaveBeenCalled();
    expect(loggingService.logInfo).not.toHaveBeenCalled();
  });

  it('does not log a query outside Learning', async () => {
    listen();
    await queryClient.fetchQuery({
      queryKey: ['shell', 'failing'],
      queryFn: () => Promise.reject(new Error('boom')),
    }).catch(() => {});

    expect(loggingService.logError).not.toHaveBeenCalled();
  });

  it('stops logging once unmounted', async () => {
    listen().unmount();
    await queryClient.fetchQuery({
      queryKey: [appId, 'failing'],
      queryFn: () => Promise.reject(new Error('boom')),
    }).catch(() => {});

    expect(loggingService.logError).not.toHaveBeenCalled();
  });
});

describe('shouldRetryQuery', () => {
  const httpError = (status: number) => ({ response: { status } });

  it.each([400, 401, 403, 404, 422])('does not retry client error %s', (status) => {
    expect(shouldRetryQuery(0, httpError(status))).toBe(false);
  });

  it('does not retry a NonRetryableError (our own deterministic throw)', () => {
    expect(shouldRetryQuery(0, new NonRetryableError('bad response'))).toBe(false);
  });

  it.each([500, 502, 503])('retries server error %s until 3 attempts', (status) => {
    expect(shouldRetryQuery(0, httpError(status))).toBe(true);
    expect(shouldRetryQuery(2, httpError(status))).toBe(true);
    expect(shouldRetryQuery(3, httpError(status))).toBe(false);
  });

  it('retries network (undefined-status) errors until 3 attempts', () => {
    const networkError = new Error('Network Error');
    expect(shouldRetryQuery(0, networkError)).toBe(true);
    expect(shouldRetryQuery(2, networkError)).toBe(true);
    expect(shouldRetryQuery(3, networkError)).toBe(false);
  });

  it('is the retry policy in queryDefaults', () => {
    expect(queryDefaults.retry).toBe(shouldRetryQuery);
  });
});

describe('queryDefaults retry behavior on a client with library defaults (integration)', () => {
  const attemptsFor = async (error: unknown): Promise<number> => {
    const queryFn = jest.fn().mockRejectedValue(error);
    await new QueryClient().fetchQuery({
      ...queryDefaults, queryKey: ['retry-test'], queryFn, retryDelay: 0,
    }).catch(() => {});
    return queryFn.mock.calls.length;
  };

  it('does not retry a 4xx (1 attempt)', async () => {
    expect(await attemptsFor({ response: { status: 403 } })).toBe(1);
  });

  it('does not retry a NonRetryableError (1 attempt)', async () => {
    expect(await attemptsFor(new NonRetryableError('bad response'))).toBe(1);
  });

  it('retries a 5xx server error (4 attempts: 1 + 3 retries)', async () => {
    expect(await attemptsFor({ response: { status: 500 } })).toBe(4);
  });

  it('retries a network error (4 attempts: 1 + 3 retries)', async () => {
    expect(await attemptsFor(new Error('network'))).toBe(4);
  });
});

describe('queryDefaults', () => {
  it('disables refetchOnWindowFocus (parity with the pre-RQ no-focus-refetch behavior)', () => {
    expect(queryDefaults.refetchOnWindowFocus).toBe(false);
  });
});

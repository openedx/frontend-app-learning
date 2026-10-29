import { QueryClient } from '@tanstack/react-query';

import { queryDefaults, shouldRetryQuery } from './queryClient';
import { NonRetryableError } from './data/http-error';

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

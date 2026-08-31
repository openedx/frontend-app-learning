import { QueryClient } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';

import { reducer as modelsReducer } from './generic/model-store';
import { createAppQueryCache, createQueryClient, shouldRetryQuery } from './queryClient';
import { NonRetryableError } from './data/http-error';
import { initializeMockApp } from './setupTest';

const { loggingService } = initializeMockApp();

const makeStore = () => configureStore({ reducer: { models: modelsReducer } });

describe('app query cache', () => {
  let store: ReturnType<typeof makeStore>;
  let queryClient: QueryClient;

  beforeEach(() => {
    store = makeStore();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
      queryCache: createAppQueryCache(store),
    });
    loggingService.logError.mockReset();
    loggingService.logInfo.mockReset();
  });

  it('reports query errors through onError', async () => {
    const error = new Error('boom');
    await queryClient.fetchQuery({
      queryKey: ['failing'],
      queryFn: () => Promise.reject(error),
    }).catch(() => {});

    expect(loggingService.logError).toHaveBeenCalledWith(error, undefined);
  });

  it('logs a status listed in `logStatusAs` at that level instead of as an error', async () => {
    const error = { response: { status: 403 } };
    await queryClient.fetchQuery({
      queryKey: ['forbidden'],
      queryFn: () => Promise.reject(error),
      meta: { logStatusAs: { 403: 'info' } },
    }).catch(() => {});

    expect(loggingService.logInfo).toHaveBeenCalledWith(error, undefined);
    expect(loggingService.logError).not.toHaveBeenCalled();
  });

  it('bridges successful results into the model store through onSuccess', async () => {
    await queryClient.fetchQuery({
      queryKey: ['ok'],
      queryFn: () => Promise.resolve({ value: 42 }),
      meta: { modelType: 'widget', courseId: 'course-1' },
    });

    const models = store.getState().models as Record<string, Record<string, unknown>>;
    expect(models.widget['course-1']).toEqual({ id: 'course-1', value: 42 });
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

  it('is wired in as the default query retry policy on createQueryClient', () => {
    const store = configureStore({ reducer: { models: modelsReducer } });
    expect(createQueryClient(store).getDefaultOptions().queries?.retry).toBe(shouldRetryQuery);
  });
});

describe('createQueryClient retry behavior (integration)', () => {
  const attemptsFor = async (error: unknown): Promise<number> => {
    const store = configureStore({ reducer: { models: modelsReducer } });
    const queryFn = jest.fn().mockRejectedValue(error);
    await createQueryClient(store).fetchQuery({
      queryKey: ['retry-test'], queryFn, retryDelay: 0,
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

describe('createQueryClient defaults', () => {
  it('disables refetchOnWindowFocus (parity with the pre-RQ no-focus-refetch behavior)', () => {
    const store = configureStore({ reducer: { models: modelsReducer } });
    expect(createQueryClient(store).getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });
});

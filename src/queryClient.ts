import { logError, logInfo } from '@edx/frontend-platform/logging';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { Store } from 'redux';

import { bridgeToModelStore, type ModelStoreMeta } from './data/modelStoreBridge';
import { getResponseStatus, isNonRetryable } from './data/http-error';

// frontend-platform doesn't type its log functions, so name the shape here.
type Logger = (error: string | Error) => void;
export type LogLevel = 'error' | 'info' | 'silent';
const loggers: Record<LogLevel, Logger> = {
  error: logError,
  info: logInfo,
  silent: () => {},
};

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: ModelStoreMeta & { logStatusAs?: Record<number, LogLevel> };
  }
}

// `onSuccess` bridges results into the model store (transitional, #1977); the `store` param
// exists only to feed it and goes away when the bridge is removed.
export const createAppQueryCache = (store: Store) => new QueryCache({
  onSuccess: (data, query) => bridgeToModelStore(store, data, query),
  onError: (error, query) => {
    const status = getResponseStatus(error);
    const level = (status !== undefined && query.meta?.logStatusAs?.[status]) || 'error';
    loggers[level](error);
  },
});

export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (isNonRetryable(error)) {
    return false;
  }
  const status = getResponseStatus(error);
  if (status !== undefined && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < 3;
};

export const createQueryClient = (store: Store) => new QueryClient({
  queryCache: createAppQueryCache(store),
  defaultOptions: {
    queries: { retry: shouldRetryQuery, refetchOnWindowFocus: false },
  },
});

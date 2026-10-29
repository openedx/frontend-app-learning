import { useEffect } from 'react';
import { logError, logInfo } from '@openedx/frontend-base';
import {
  matchQuery, type Query, type QueryCacheNotifyEvent, useQueryClient,
} from '@tanstack/react-query';

import { appId } from './constants';
import { getResponseStatus, isNonRetryable } from './data/http-error';

export type LogLevel = 'error' | 'info' | 'silent';
const loggers: Record<LogLevel, typeof logError> = {
  error: logError,
  info: logInfo,
  silent: () => {},
};

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { logStatusAs?: Record<number, LogLevel> };
  }
}

const logQueryError = (error: Error, query: Query) => {
  const status = getResponseStatus(error);
  const level = (status !== undefined && query.meta?.logStatusAs?.[status]) || 'error';
  loggers[level](error);
};

const learningQueries = { queryKey: [appId] };

const logLearningQueryError = (event: QueryCacheNotifyEvent) => {
  if (
    event.type === 'updated'
    && event.action.type === 'error'
    && matchQuery(learningQueries, event.query)
  ) {
    logQueryError(event.action.error, event.query);
  }
};

export const useQueryErrorLogging = () => {
  const queryClient = useQueryClient();
  useEffect(() => queryClient.getQueryCache().subscribe(logLearningQueryError), [queryClient]);
};

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

export const queryDefaults = {
  retry: shouldRetryQuery,
  refetchOnWindowFocus: false,
} as const;

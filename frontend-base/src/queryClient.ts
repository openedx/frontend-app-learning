import { getResponseStatus, isNonRetryable } from './data/http-error';

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

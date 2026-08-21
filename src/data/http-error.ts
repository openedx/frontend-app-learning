export interface RequestError {
  response?: { status?: number; data?: { detail?: string; error_code?: string } };
}

export const getResponseStatus = (error: unknown): number | undefined => (
  (error as RequestError | null)?.response?.status
);

export class NonRetryableError extends Error {
  nonRetryable = true;
}

export const isNonRetryable = (error: unknown): boolean => (
  (error as NonRetryableError | null)?.nonRetryable === true
);

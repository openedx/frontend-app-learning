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

export const getErrorDetail = (error: unknown): string | undefined => {
  const { status, data } = (error as RequestError | null)?.response ?? {};

  // only return error detail for codes that have
  // associated backend-authored learner-facing prose
  switch (status) {
    case 403:
      return data?.detail;
    default:
      return undefined;
  }
};

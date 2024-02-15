import { logError } from '@edx/frontend-platform/logging';
import { renderHook } from '@testing-library/react-hooks';
import { useExamAccessToken, useFetchExamAccessToken, useIsExam } from '@edx/frontend-lib-special-exams';

import { initializeMockApp } from '../../../../../setupTest';
import useExamAccess from './useExamAccess';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-lib-special-exams', () => ({
  useExamAccessToken: jest.fn(),
  useFetchExamAccessToken: jest.fn(),
  useIsExam: jest.fn(() => false),
}));

const id = 'test-id';

const mockFetchExamAccessToken = jest.fn().mockImplementation(() => Promise.resolve());
useFetchExamAccessToken.mockReturnValue(mockFetchExamAccessToken);

const testAccessToken = 'test-access-token';

describe('useExamAccess hook', () => {
  beforeAll(async () => {
    // We need to mock AuthService to implicitly use `getAuthenticatedUser` within `AppContext.Provider`.
    await initializeMockApp();
  });
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock implementations from previous test runs may not have been "consumed", so reset mock implementations.
    useExamAccessToken.mockReset();
    useExamAccessToken.mockReturnValueOnce('');
    useExamAccessToken.mockReturnValueOnce(testAccessToken);
  });
  describe.only('behavior', () => {
    it('returns accessToken and blockAccess and doesn\'t call token API if not an exam', () => {
      const { result } = renderHook(() => useExamAccess({ id }));
      const { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual('');
      expect(blockAccess).toBe(false);
      expect(mockFetchExamAccessToken).not.toHaveBeenCalled();
    });
    it('returns true for blockAccess if an exam but accessToken not yet fetched', () => {
      useIsExam.mockImplementation(() => (true));

      const { result } = renderHook(() => useExamAccess({ id }));
      const { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual('');
      expect(blockAccess).toBe(true);
      expect(mockFetchExamAccessToken).toHaveBeenCalled();
    });
    it('returns false for blockAccess if an exam and accessToken fetch succeeds', async () => {
      useIsExam.mockImplementation(() => (true));
      const { result, waitForNextUpdate } = renderHook(() => useExamAccess({ id }));

      // We wait for the promise to resolve and for updates to state to complete so that blockAccess is updated.
      await waitForNextUpdate();

      const { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual(testAccessToken);
      expect(blockAccess).toBe(false);
      expect(mockFetchExamAccessToken).toHaveBeenCalled();
    });
    it('returns false for blockAccess if an exam and accessToken fetch fails', async () => {
      useIsExam.mockImplementation(() => (true));

      const testError = 'test-error';
      mockFetchExamAccessToken.mockImplementationOnce(() => Promise.reject(testError));

      const { result, waitForNextUpdate } = renderHook(() => useExamAccess({ id }));

      // We wait for the promise to resolve and for updates to state to complete so that blockAccess is updated.
      await waitForNextUpdate();

      const { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual(testAccessToken);
      expect(blockAccess).toBe(false);
      expect(mockFetchExamAccessToken).toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(testError);
    });
  });
});

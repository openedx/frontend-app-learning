import { useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { act, renderHook } from '@testing-library/react-hooks';
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

// This object allows us to manipulate the value of the accessToken.
const testAccessToken = { curr: '' };

const mockFetchExamAccessToken = jest.fn().mockImplementation(() => Promise.resolve());
useFetchExamAccessToken.mockReturnValue(mockFetchExamAccessToken);

const mockUseIsExam = (initialState = false) => {
  const [isExam, setIsExam] = useState(initialState);

  // This setTimeout block is intended to replicate the case where a unit is an exam, but
  // the call to fetch exam metadata has not yet completed. That is the value of isExam starts
  // as false and transitions to true once the call resolves.
  if (!initialState) {
    setTimeout(
      () => setIsExam(true),
      500,
    );
  }

  return isExam;
};

describe('useExamAccess hook', () => {
  beforeAll(async () => {
    // We need to mock AuthService to implicitly use `getAuthenticatedUser` within `AppContext.Provider`.
    await initializeMockApp();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useExamAccessToken.mockReset();

    useIsExam.mockImplementation(() => mockUseIsExam());
    useExamAccessToken.mockImplementation(() => testAccessToken.curr);
  });
  describe('behavior', () => {
    it('returns accessToken and blockAccess and doesn\'t call token API if not an exam', () => {
      const { result } = renderHook(() => useExamAccess({ id }));
      const { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual('');
      expect(blockAccess).toBe(false);
      expect(mockFetchExamAccessToken).not.toHaveBeenCalled();
    });
    it('returns true for blockAccess if an exam but accessToken not yet fetched', async () => {
      useIsExam.mockImplementation(() => mockUseIsExam(true));

      const { result, waitForNextUpdate } = renderHook(() => useExamAccess({ id }));
      const { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual('');
      expect(blockAccess).toBe(true);
      expect(mockFetchExamAccessToken).toHaveBeenCalled();

      // This is to get rid of the act(...) warning.
      await act(async () => {
        await waitForNextUpdate();
      });
    });
    it('returns false for blockAccess if an exam and accessToken fetch succeeds', async () => {
      useIsExam.mockImplementation(() => mockUseIsExam(true));
      const { result, waitForNextUpdate } = renderHook(() => useExamAccess({ id }));

      // We wait for the promise to resolve and for updates to state to complete so that blockAccess is updated.
      await waitForNextUpdate();

      const { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual(testAccessToken.curr);
      expect(blockAccess).toBe(false);
      expect(mockFetchExamAccessToken).toHaveBeenCalled();
    });
    it('in progress', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useExamAccess({ id }));

      let { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual('');
      expect(blockAccess).toBe(false);
      expect(mockFetchExamAccessToken).not.toHaveBeenCalled();

      testAccessToken.curr = 'test-access-token';

      // The runAllTimers will update the value of isExam, and the waitForNextUpdate will
      // wait for call to setBlockAccess in the finally clause of useEffect hook.
      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      ({ accessToken, blockAccess } = result.current);

      expect(accessToken).toEqual('test-access-token');
      expect(blockAccess).toBe(false);
      expect(mockFetchExamAccessToken).toHaveBeenCalled();
    });
    it('returns false for blockAccess if an exam and accessToken fetch fails', async () => {
      useIsExam.mockImplementation(() => mockUseIsExam(true));

      const testError = 'test-error';
      mockFetchExamAccessToken.mockImplementationOnce(() => Promise.reject(testError));

      const { result, waitForNextUpdate } = renderHook(() => useExamAccess({ id }));

      // We wait for the promise to resolve and for updates to state to complete so that blockAccess is updated.
      await waitForNextUpdate();

      const { accessToken, blockAccess } = result.current;

      expect(accessToken).toEqual(testAccessToken.curr);
      expect(blockAccess).toBe(false);
      expect(mockFetchExamAccessToken).toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(testError);
    });
  });
});

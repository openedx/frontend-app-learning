import React from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import { getExamAccess, fetchExamAccess, isExam } from '@edx/frontend-lib-special-exams';
import { isEqual } from 'lodash';

import { waitFor } from '../../../../../setupTest';
import useExamAccess, { stateKeys } from './useExamAccess';

const getEffect = (prereqs) => {
  const { calls } = React.useEffect.mock;
  const match = calls.filter(call => isEqual(call[1], prereqs));
  return match.length ? match[0][0] : null;
};

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-lib-special-exams', () => ({
  getExamAccess: jest.fn(),
  fetchExamAccess: jest.fn(),
  isExam: jest.fn(() => false),
}));

const state = mockUseKeyedState(stateKeys);

const id = 'test-id';

const mockFetchExamAccess = Promise.resolve();
fetchExamAccess.mockReturnValue(mockFetchExamAccess);

const testAccessToken = 'test-access-token';
getExamAccess.mockReturnValue(testAccessToken);

describe('useExamAccess hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  describe('behavior', () => {
    it('initializes access token to empty string', () => {
      useExamAccess({ id });
      state.expectInitializedWith(stateKeys.accessToken, '');
    });
    it('initializes blockAccess to true if is an exam', () => {
      useExamAccess({ id });
      state.expectInitializedWith(stateKeys.blockAccess, false);
    });
    it('initializes blockAccess to false if is not an exam', () => {
      isExam.mockReturnValueOnce(true);
      useExamAccess({ id });
      state.expectInitializedWith(stateKeys.blockAccess, true);
    });
    describe('effects - on id change', () => {
      let useEffectCb;
      beforeEach(() => {
        useExamAccess({ id });
        useEffectCb = getEffect([id], React);
      });
      it('does not call fetchExamAccess if not an exam', () => {
        useEffectCb();
        expect(fetchExamAccess).not.toHaveBeenCalled();
      });
      it('fetches and sets exam access if isExam', async () => {
        isExam.mockReturnValueOnce(true);
        useEffectCb();
        await waitFor(() => expect(fetchExamAccess).toHaveBeenCalled());
        state.expectSetStateCalledWith(stateKeys.accessToken, testAccessToken);
        state.expectSetStateCalledWith(stateKeys.blockAccess, false);
      });
      const testError = 'test-error';
      it('logs error if fetchExamAccess fails', async () => {
        isExam.mockReturnValueOnce(true);
        fetchExamAccess.mockReturnValueOnce(Promise.reject(testError));
        useEffectCb();
        await waitFor(() => expect(fetchExamAccess).toHaveBeenCalled());
        expect(logError).toHaveBeenCalledWith(testError);
      });
    });
  });
  describe('output', () => {
    it('forwards blockAccess and accessToken from state fields', () => {
      const testBlockAccess = 'test-block-access';
      state.mockVals({
        blockAccess: testBlockAccess,
        accessToken: testAccessToken,
      });
      const out = useExamAccess({ id });
      expect(out.blockAccess).toEqual(testBlockAccess);
      expect(out.accessToken).toEqual(testAccessToken);
      state.resetVals();
    });
  });
});

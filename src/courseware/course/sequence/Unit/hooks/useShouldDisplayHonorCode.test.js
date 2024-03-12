import React from 'react';

import { getEffects, mockUseKeyedState } from '@edx/react-unit-test-utils';
import { useModel } from '@src/generic/model-store';

import { modelKeys } from '../constants';

import useShouldDisplayHonorCode, { stateKeys } from './useShouldDisplayHonorCode';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));
jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn(),
}));

const state = mockUseKeyedState(stateKeys);

const props = {
  id: 'test-id',
  courseId: 'test-course-id',
};

const mockModels = (graded, userNeedsIntegritySignature) => {
  useModel.mockImplementation((key) => (
    (key === modelKeys.units) ? { graded } : { userNeedsIntegritySignature }
  ));
};

describe('useShouldDisplayHonorCode hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModels(false, false);
    state.mock();
  });
  describe('behavior', () => {
    it('initializes shouldDisplay to false', () => {
      useShouldDisplayHonorCode(props);
      state.expectInitializedWith(stateKeys.shouldDisplay, false);
    });
    describe('effect - on userNeedsIntegritySignature', () => {
      describe('graded and needs integrity signature', () => {
        it('sets shouldDisplay(true)', () => {
          mockModels(true, true);
          useShouldDisplayHonorCode(props);
          const cb = getEffects([state.setState.shouldDisplay, true], React)[0];
          cb();
          expect(state.setState.shouldDisplay).toHaveBeenCalledWith(true);
        });
      });
      describe('not graded', () => {
        it('sets should not display', () => {
          mockModels(true, false);
          useShouldDisplayHonorCode(props);
          const cb = getEffects([state.setState.shouldDisplay, false], React)[0];
          cb();
          expect(state.setState.shouldDisplay).toHaveBeenCalledWith(false);
        });
      });
      describe('does not need integrity signature', () => {
        it('sets should not display', () => {
          mockModels(false, true);
          useShouldDisplayHonorCode(props);
          const cb = getEffects([state.setState.shouldDisplay, true], React)[0];
          cb();
          expect(state.setState.shouldDisplay).toHaveBeenCalledWith(false);
        });
      });
    });
  });
  describe('output', () => {
    it('returns shouldDisplay value from state', () => {
      const testValue = 'test-value';
      state.mockVal(stateKeys.shouldDisplay, testValue);
      expect(useShouldDisplayHonorCode(props)).toEqual(testValue);
    });
  });
});

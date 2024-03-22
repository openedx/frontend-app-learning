import { getConfig } from '@edx/frontend-platform';
import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import React from 'react';
import { isEqual } from 'lodash';
import { logError } from '@edx/frontend-platform/logging';
import { waitFor } from '@testing-library/dom';
import { getBlockMetadataWithChildren } from '../../../../data/api';
import useLoadUnitChildren, { stateKeys } from './useLoadUnitChildren';

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
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));
getConfig.mockReturnValue({ RENDER_XBLOCKS_EXPERIMENTAL: false });

jest.mock('../../../../data/api', () => ({
  getBlockMetadataWithChildren: jest.fn(),
}));
const mockChildren = ['child1', 'child2'];
getBlockMetadataWithChildren.mockResolvedValue({ children: mockChildren });

const state = mockUseKeyedState(stateKeys);

describe('useLoadUnitChildren hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  describe('behavior', () => {
    const usageId = 'testUsageId';

    it('initializes children with an empty array', () => {
      useLoadUnitChildren(usageId);
      state.expectInitializedWith(stateKeys.unitChildren, []);
    });

    it('does not fetch children when RENDER_XBLOCKS_EXPERIMENTAL is false (default)', () => {
      getBlockMetadataWithChildren.mockResolvedValue({ children: mockChildren });

      useLoadUnitChildren(usageId);
      state.expectInitializedWith(stateKeys.unitChildren, []);

      const useEffectCb = getEffect([usageId], React);
      expect(useEffectCb).toBeNull();

      expect(getBlockMetadataWithChildren).not.toHaveBeenCalled();
      expect(state.setState[stateKeys.unitChildren]).not.toHaveBeenCalled();
    });

    it('fetches children when RENDER_XBLOCKS_EXPERIMENTAL is true', async () => {
      getConfig.mockReturnValueOnce({ RENDER_XBLOCKS_EXPERIMENTAL: true });
      getBlockMetadataWithChildren.mockResolvedValue({ children: mockChildren });

      useLoadUnitChildren(usageId);
      state.expectInitializedWith(stateKeys.unitChildren, []);

      getEffect([usageId], React)();

      await waitFor(() => expect(getBlockMetadataWithChildren).toHaveBeenCalled());
      state.expectSetStateCalledWith(stateKeys.unitChildren, mockChildren);
    });

    it('logs an error when fetching children fails', async () => {
      const testError = 'test-error';
      getConfig.mockReturnValueOnce({ RENDER_XBLOCKS_EXPERIMENTAL: true });
      getBlockMetadataWithChildren.mockRejectedValue(testError);

      useLoadUnitChildren(usageId);
      state.expectInitializedWith(stateKeys.unitChildren, []);

      getEffect([usageId], React)();

      await waitFor(() => expect(getBlockMetadataWithChildren).toHaveBeenCalled());
      expect(state.setState[stateKeys.unitChildren]).not.toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith(testError);
    });
  });
});

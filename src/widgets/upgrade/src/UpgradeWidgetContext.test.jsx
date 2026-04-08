import React from 'react';
import { renderHook, act } from '@testing-library/react';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import * as localStorageModule from '@src/data/localStorage';
import { UpgradeWidgetProvider, useUpgradeWidgetContext } from './UpgradeWidgetContext';

jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
}));

const courseId = 'course-test-123';

function makeWrapper(contextValue = { courseId }) {
  // eslint-disable-next-line react/prop-types
  return function Wrapper({ children }) {
    return (
      <SidebarContext.Provider value={contextValue}>
        <UpgradeWidgetProvider>
          {children}
        </UpgradeWidgetProvider>
      </SidebarContext.Provider>
    );
  };
}

describe('UpgradeWidgetContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageModule.getLocalStorage.mockReturnValue(null);
  });

  describe('UpgradeWidgetProvider initial state', () => {
    it('provides default upgradeWidgetStatus as "active" when nothing in localStorage', () => {
      const { result } = renderHook(() => useUpgradeWidgetContext(), { wrapper: makeWrapper() });

      expect(result.current.upgradeWidgetStatus).toBe('active');
    });

    it('reads initial upgradeWidgetStatus from localStorage', () => {
      localStorageModule.getLocalStorage.mockImplementation((key) => {
        if (key === `upgradeWidget.${courseId}`) { return 'inactive'; }
        return null;
      });
      const { result } = renderHook(() => useUpgradeWidgetContext(), { wrapper: makeWrapper() });

      expect(result.current.upgradeWidgetStatus).toBe('inactive');
    });

    it('provides default upgradeCurrentState as null when nothing in localStorage', () => {
      const { result } = renderHook(() => useUpgradeWidgetContext(), { wrapper: makeWrapper() });

      expect(result.current.upgradeCurrentState).toBeNull();
    });

    it('reads initial upgradeCurrentState from localStorage', () => {
      localStorageModule.getLocalStorage.mockImplementation((key) => {
        if (key === `upgradeWidgetState.${courseId}`) { return 'step-2'; }
        return null;
      });
      const { result } = renderHook(() => useUpgradeWidgetContext(), { wrapper: makeWrapper() });

      expect(result.current.upgradeCurrentState).toBe('step-2');
    });
  });

  describe('setUpgradeWidgetStatus', () => {
    it('updates state and persists to localStorage', () => {
      const { result } = renderHook(() => useUpgradeWidgetContext(), { wrapper: makeWrapper() });
      act(() => {
        result.current.setUpgradeWidgetStatus('inactive');
      });

      expect(result.current.upgradeWidgetStatus).toBe('inactive');
      expect(localStorageModule.setLocalStorage).toHaveBeenCalledWith(
        `upgradeWidget.${courseId}`,
        'inactive',
      );
    });
  });

  describe('setUpgradeCurrentState', () => {
    it('updates state and persists to localStorage', () => {
      const { result } = renderHook(() => useUpgradeWidgetContext(), { wrapper: makeWrapper() });
      act(() => {
        result.current.setUpgradeCurrentState('step-3');
      });

      expect(result.current.upgradeCurrentState).toBe('step-3');
      expect(localStorageModule.setLocalStorage).toHaveBeenCalledWith(
        `upgradeWidgetState.${courseId}`,
        'step-3',
      );
    });
  });

  describe('onUpgradeWidgetSeen', () => {
    it('sets upgradeWidgetStatus to "inactive"', () => {
      const { result } = renderHook(() => useUpgradeWidgetContext(), { wrapper: makeWrapper() });
      act(() => {
        result.current.onUpgradeWidgetSeen();
      });

      expect(result.current.upgradeWidgetStatus).toBe('inactive');
      expect(localStorageModule.setLocalStorage).toHaveBeenCalledWith(
        `upgradeWidget.${courseId}`,
        'inactive',
      );
    });
  });

  describe('useUpgradeWidgetContext error guard', () => {
    it('throws when used outside UpgradeWidgetProvider', () => {
      // eslint-disable-next-line no-console
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderHook(() => useUpgradeWidgetContext());
      }).toThrow('useUpgradeWidgetContext must be used inside UpgradeWidgetProvider');
      consoleSpy.mockRestore();
    });
  });
});

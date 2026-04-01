import { renderHook } from '@testing-library/react';
import { WIDGETS } from '@src/constants';
import { useInitialSidebar } from './useInitialSidebar';

import { getSidebarId, isOutlineSidebarCollapsed } from '../utils/storage';

jest.mock('../utils/storage', () => ({
  getSidebarId: jest.fn(),
  isOutlineSidebarCollapsed: jest.fn(),
}));

const courseId = 'course-123';

function buildParams(overrides = {}) {
  return {
    courseId,
    shouldDisplayFullScreen: false,
    isInitiallySidebarOpen: true,
    getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
    getAvailableWidgets: jest.fn(() => [{ id: 'DISCUSSIONS', priority: 10 }]),
    ...overrides,
  };
}

describe('useInitialSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSidebarId.mockReturnValue(null);
    isOutlineSidebarCollapsed.mockReturnValue(false);
  });

  describe('mobile (shouldDisplayFullScreen=true)', () => {
    it('returns stored sidebar ID when present', () => {
      getSidebarId.mockReturnValue('DISCUSSIONS');
      const { result } = renderHook(() => useInitialSidebar(buildParams({ shouldDisplayFullScreen: true })));

      expect(result.current).toBe('DISCUSSIONS');
    });

    it('returns null when no sidebar is stored', () => {
      const { result } = renderHook(() => useInitialSidebar(buildParams({ shouldDisplayFullScreen: true })));

      expect(result.current).toBeNull();
    });
  });

  describe('desktop (shouldDisplayFullScreen=false)', () => {
    it('returns null when sidebar is not initially open', () => {
      const { result } = renderHook(() => useInitialSidebar(buildParams({ isInitiallySidebarOpen: false })));

      expect(result.current).toBeNull();
    });

    it('returns COURSE_OUTLINE when no right panels and outline is not collapsed', () => {
      const { result } = renderHook(() => useInitialSidebar(buildParams({
        getFirstAvailablePanel: jest.fn(() => null),
        getAvailableWidgets: jest.fn(() => []),
      })));

      expect(result.current).toBe(WIDGETS.COURSE_OUTLINE);
    });

    it('returns null when no right panels and outline is collapsed', () => {
      isOutlineSidebarCollapsed.mockReturnValue(true);
      const { result } = renderHook(() => useInitialSidebar(buildParams({
        getFirstAvailablePanel: jest.fn(() => null),
        getAvailableWidgets: jest.fn(() => []),
      })));

      expect(result.current).toBeNull();
    });

    it('returns the first available right panel when no stored preference', () => {
      const { result } = renderHook(() => useInitialSidebar(buildParams()));

      expect(result.current).toBe('DISCUSSIONS');
    });

    it('returns stored right panel when still available and not outranked', () => {
      getSidebarId.mockReturnValue('DISCUSSIONS');
      const { result } = renderHook(() => useInitialSidebar(buildParams({
        getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
        getAvailableWidgets: jest.fn(() => [{ id: 'DISCUSSIONS', priority: 10 }]),
      })));

      expect(result.current).toBe('DISCUSSIONS');
    });

    it('returns higher-priority panel instead of stored lower-priority panel', () => {
      getSidebarId.mockReturnValue('NOTES');
      const { result } = renderHook(() => useInitialSidebar(buildParams({
        getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
        getAvailableWidgets: jest.fn(() => [
          { id: 'DISCUSSIONS', priority: 10 },
          { id: 'NOTES', priority: 20 },
        ]),
      })));

      expect(result.current).toBe('DISCUSSIONS');
    });

    it('returns firstAvailable when stored sidebar was COURSE_OUTLINE and outline is not collapsed', () => {
      getSidebarId.mockReturnValue(WIDGETS.COURSE_OUTLINE);
      const { result } = renderHook(() => useInitialSidebar(buildParams()));

      expect(result.current).toBe('DISCUSSIONS');
    });

    it('returns firstAvailable when stored panel is no longer in available widgets', () => {
      getSidebarId.mockReturnValue('NOTES');
      const { result } = renderHook(() => useInitialSidebar(buildParams({
        getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
        getAvailableWidgets: jest.fn(() => [{ id: 'DISCUSSIONS', priority: 10 }]),
      })));

      expect(result.current).toBe('DISCUSSIONS');
    });
  });
});

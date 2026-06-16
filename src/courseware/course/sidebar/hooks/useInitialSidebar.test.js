import { renderHook } from '@testing-library/react';
import { WIDGETS } from '@src/constants';
import { useInitialSidebar } from './useInitialSidebar';

import {
  getSidebarId,
  isSidebarClosedByUser,
} from '../utils/storage';

jest.mock('../utils/storage', () => ({
  getSidebarId: jest.fn(),
  isSidebarClosedByUser: jest.fn(),
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
    isSidebarClosedByUser.mockReturnValue(false);
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

    it('returns null when sidebar was closed by user', () => {
      getSidebarId.mockReturnValue('DISCUSSIONS');
      isSidebarClosedByUser.mockReturnValue(true);
      const { result } = renderHook(() => useInitialSidebar(buildParams({ shouldDisplayFullScreen: true })));

      expect(result.current).toBeNull();
    });
  });

  describe('desktop (shouldDisplayFullScreen=false)', () => {
    it('returns null when isInitiallySidebarOpen is false', () => {
      const { result } = renderHook(() => useInitialSidebar(buildParams({ isInitiallySidebarOpen: false })));

      expect(result.current).toBeNull();
    });

    it('returns null when sidebar was closed by user', () => {
      getSidebarId.mockReturnValue('DISCUSSIONS');
      isSidebarClosedByUser.mockReturnValue(true);
      const { result } = renderHook(() => useInitialSidebar(buildParams()));

      expect(result.current).toBeNull();
    });

    describe('when isInitiallySidebarOpen is true and the sidebar has not been closed by the user', () => {
      describe('with no stored preference', () => {
        it('returns COURSE_OUTLINE', () => {
          const { result } = renderHook(() => useInitialSidebar(buildParams()));

          expect(result.current).toBe(WIDGETS.COURSE_OUTLINE);
        });
      });

      describe('with stored RIGHT panel', () => {
        it('returns stored RIGHT panel when still available and not outranked', () => {
          getSidebarId.mockReturnValue('DISCUSSIONS');
          const { result } = renderHook(() => useInitialSidebar(buildParams({
            getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
            getAvailableWidgets: jest.fn(() => [{ id: 'DISCUSSIONS', priority: 10 }]),
          })));

          expect(result.current).toBe('DISCUSSIONS');
        });

        it('returns stored RIGHT panel even before widget data has loaded', () => {
          getSidebarId.mockReturnValue('DISCUSSIONS');
          const { result } = renderHook(() => useInitialSidebar(buildParams({
            getFirstAvailablePanel: jest.fn(() => null),
            getAvailableWidgets: jest.fn(() => []),
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

        it('returns firstAvailable when stored panel is no longer in available widgets', () => {
          getSidebarId.mockReturnValue('NOTES');
          const { result } = renderHook(() => useInitialSidebar(buildParams({
            getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
            getAvailableWidgets: jest.fn(() => [{ id: 'DISCUSSIONS', priority: 10 }]),
          })));

          expect(result.current).toBe('DISCUSSIONS');
        });
      });

      describe('with stored COURSE_OUTLINE', () => {
        it('returns COURSE_OUTLINE', () => {
          getSidebarId.mockReturnValue(WIDGETS.COURSE_OUTLINE);
          const { result } = renderHook(() => useInitialSidebar(buildParams()));

          expect(result.current).toBe(WIDGETS.COURSE_OUTLINE);
        });
      });
    });
  });
});

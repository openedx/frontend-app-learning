import { renderHook } from '@testing-library/react';
import { WIDGETS } from '@src/constants';
import { useUnitShiftBehavior } from './useUnitShiftBehavior';

import { setSidebarId, isSidebarClosedByUser } from '../utils/storage';

jest.mock('../utils/storage', () => ({
  setSidebarId: jest.fn(),
  isSidebarClosedByUser: jest.fn(),
}));

const courseId = 'course-123';

function buildParams(overrides = {}) {
  return {
    unitId: 'unit-1',
    currentSidebar: null,
    setCurrentSidebar: jest.fn(),
    getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
    getAvailableWidgets: jest.fn(() => [{ id: 'DISCUSSIONS', priority: 10 }]),
    courseId,
    shouldDisplayFullScreen: false,
    shouldDisplaySidebarOpen: true,
    hasUserToggledRef: { current: false },
    previousUnitIdRef: { current: null }, // null → triggers unit shift on first render
    courseOutlineSetByUnitRef: { current: null },
    isInitialLoadRef: { current: false },
    ...overrides,
  };
}

describe('useUnitShiftBehavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isSidebarClosedByUser.mockReturnValue(false);
  });

  it('does nothing when unitId has not changed since last render', () => {
    const params = buildParams({ previousUnitIdRef: { current: 'unit-1' } });
    renderHook(() => useUnitShiftBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
  });

  it('skips auto-switching on mobile (shouldDisplayFullScreen=true)', () => {
    const params = buildParams({ shouldDisplayFullScreen: true });
    renderHook(() => useUnitShiftBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
  });

  it('does nothing when sidebar was closed by user', () => {
    isSidebarClosedByUser.mockReturnValue(true);
    const params = buildParams();
    renderHook(() => useUnitShiftBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    expect(setSidebarId).not.toHaveBeenCalled();
  });

  it('resets hasUserToggledRef to false on unit change', () => {
    const hasUserToggledRef = { current: true };
    renderHook(() => useUnitShiftBehavior(buildParams({ hasUserToggledRef })));

    expect(hasUserToggledRef.current).toBe(false);
  });

  it('updates previousUnitIdRef to the current unitId after a unit change', () => {
    const previousUnitIdRef = { current: null };
    renderHook(() => useUnitShiftBehavior(buildParams({ previousUnitIdRef })));

    expect(previousUnitIdRef.current).toBe('unit-1');
  });

  describe('when shouldDisplayFullScreen is false and the sidebar has not been closed by the user', () => {
    describe('COURSE_OUTLINE is currently open', () => {
      it('keeps COURSE_OUTLINE open when a right panel is available', () => {
        const params = buildParams({ currentSidebar: WIDGETS.COURSE_OUTLINE });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).not.toHaveBeenCalled();
        expect(setSidebarId).not.toHaveBeenCalled();
        // marks this unit as having the outline open
        expect(params.courseOutlineSetByUnitRef.current).toBe('unit-1');
      });

      it('keeps COURSE_OUTLINE open when no right panels are available', () => {
        const params = buildParams({
          currentSidebar: WIDGETS.COURSE_OUTLINE,
          getFirstAvailablePanel: jest.fn(() => null),
        });
        renderHook(() => useUnitShiftBehavior(params));
        expect(params.setCurrentSidebar).not.toHaveBeenCalled();
        // marks this unit as having auto-set the outline
        expect(params.courseOutlineSetByUnitRef.current).toBe('unit-1');
      });

      it('does not set courseOutlineSetByUnitRef on initial load', () => {
        const courseOutlineSetByUnitRef = { current: null };
        const isInitialLoadRef = { current: true };
        const params = buildParams({
          currentSidebar: WIDGETS.COURSE_OUTLINE,
          getFirstAvailablePanel: jest.fn(() => null),
          courseOutlineSetByUnitRef,
          isInitialLoadRef,
        });
        renderHook(() => useUnitShiftBehavior(params));

        expect(courseOutlineSetByUnitRef.current).toBeNull();
      });
    });

    describe('no right panels available', () => {
      it('keeps current right panel open provisionally when no panels are available', () => {
        const params = buildParams({
          currentSidebar: 'DISCUSSIONS',
          getFirstAvailablePanel: jest.fn(() => null),
        });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).not.toHaveBeenCalled();
      });

      it('opens COURSE_OUTLINE as fallback when shouldDisplaySidebarOpen', () => {
        const params = buildParams({
          currentSidebar: null,
          getFirstAvailablePanel: jest.fn(() => null),
        });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).toHaveBeenCalledWith(WIDGETS.COURSE_OUTLINE);
        expect(setSidebarId).toHaveBeenCalledWith(courseId, WIDGETS.COURSE_OUTLINE);
      });

      it('closes sidebar when shouldDisplaySidebarOpen is false and no right panels', () => {
        const params = buildParams({
          currentSidebar: null,
          shouldDisplaySidebarOpen: false,
          getFirstAvailablePanel: jest.fn(() => null),
        });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).toHaveBeenCalledWith(null);
      });
    });

    describe('right panels available', () => {
      it('switches to higher-priority panel when a better panel becomes available', () => {
        const params = buildParams({
          currentSidebar: 'NOTES',
          getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
          getAvailableWidgets: jest.fn(() => [
            { id: 'DISCUSSIONS', priority: 10 },
            { id: 'NOTES', priority: 20 },
          ]),
        });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).toHaveBeenCalledWith('DISCUSSIONS');
        expect(setSidebarId).toHaveBeenCalledWith(courseId, 'DISCUSSIONS');
      });

      it('keeps current panel when no higher-priority panel is available', () => {
        const params = buildParams({
          currentSidebar: 'DISCUSSIONS',
          getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
          getAvailableWidgets: jest.fn(() => [{ id: 'DISCUSSIONS', priority: 10 }]),
        });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).not.toHaveBeenCalled();
      });

      it('switches to firstAvailable when current panel is no longer in available list', () => {
        const params = buildParams({
          currentSidebar: 'NOTES',
          getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
          getAvailableWidgets: jest.fn(() => [{ id: 'DISCUSSIONS', priority: 10 }]),
        });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).toHaveBeenCalledWith('DISCUSSIONS');
        expect(setSidebarId).toHaveBeenCalledWith(courseId, 'DISCUSSIONS');
      });

      it('opens COURSE_OUTLINE on desktop when no panel was open', () => {
        const params = buildParams({ currentSidebar: null });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).toHaveBeenCalledWith(WIDGETS.COURSE_OUTLINE);
        expect(setSidebarId).toHaveBeenCalledWith(courseId, WIDGETS.COURSE_OUTLINE);
      });

      it('does not auto-open panel when shouldDisplaySidebarOpen is false', () => {
        const params = buildParams({ currentSidebar: null, shouldDisplaySidebarOpen: false });
        renderHook(() => useUnitShiftBehavior(params));

        expect(params.setCurrentSidebar).not.toHaveBeenCalled();
      });

      it('clears courseOutlineSetByUnitRef when a RIGHT panel is current', () => {
        const courseOutlineSetByUnitRef = { current: 'unit-1' };
        const params = buildParams({
          currentSidebar: 'DISCUSSIONS',
          courseOutlineSetByUnitRef,
        });
        renderHook(() => useUnitShiftBehavior(params));

        expect(courseOutlineSetByUnitRef.current).toBeNull();
      });
    });
  });
});

import { renderHook } from '@testing-library/react';
import { WIDGETS } from '@src/constants';
import { useSidebarSync } from './useSidebarSync';

import { setSidebarId, isOutlineSidebarCollapsed } from '../utils/storage';

jest.mock('../utils/storage', () => ({
  setSidebarId: jest.fn(),
  isOutlineSidebarCollapsed: jest.fn(),
}));

const courseId = 'course-123';
const unitId = 'unit-456';

function buildParams(overrides = {}) {
  return {
    initialSidebar: 'DISCUSSIONS',
    currentSidebar: null,
    setCurrentSidebar: jest.fn(),
    courseId,
    unitId,
    shouldDisplayFullScreen: false,
    hasUserToggledRef: { current: false },
    courseOutlineSetByUnitRef: { current: null },
    ...overrides,
  };
}

describe('useSidebarSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isOutlineSidebarCollapsed.mockReturnValue(false);
  });

  describe('skip conditions', () => {
    it('skips when shouldDisplayFullScreen is true (mobile)', () => {
      const params = buildParams({ shouldDisplayFullScreen: true });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    });

    it('skips when user has manually toggled the sidebar', () => {
      const params = buildParams({ hasUserToggledRef: { current: true } });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    });

    it('skips when COURSE_OUTLINE was set by current unit navigation', () => {
      const params = buildParams({
        currentSidebar: WIDGETS.COURSE_OUTLINE,
        initialSidebar: WIDGETS.COURSE_OUTLINE,
        courseOutlineSetByUnitRef: { current: unitId },
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    });

    it('does nothing when initialSidebar already matches currentSidebar', () => {
      const params = buildParams({
        initialSidebar: 'DISCUSSIONS',
        currentSidebar: 'DISCUSSIONS',
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    });
  });

  describe('COURSE_OUTLINE sync (initialSidebar = COURSE_OUTLINE)', () => {
    it('opens COURSE_OUTLINE when currentSidebar is null and outline is not collapsed', () => {
      const params = buildParams({
        initialSidebar: WIDGETS.COURSE_OUTLINE,
        currentSidebar: null,
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).toHaveBeenCalledWith(WIDGETS.COURSE_OUTLINE);
      expect(setSidebarId).toHaveBeenCalledWith(courseId, WIDGETS.COURSE_OUTLINE);
    });

    it('does not open COURSE_OUTLINE when currentSidebar is null and outline is collapsed', () => {
      isOutlineSidebarCollapsed.mockReturnValue(true);
      const params = buildParams({
        initialSidebar: WIDGETS.COURSE_OUTLINE,
        currentSidebar: null,
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    });

    it('switches a right panel to COURSE_OUTLINE when no right panels available and not collapsed', () => {
      const params = buildParams({
        initialSidebar: WIDGETS.COURSE_OUTLINE,
        currentSidebar: 'DISCUSSIONS',
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).toHaveBeenCalledWith(WIDGETS.COURSE_OUTLINE);
      expect(setSidebarId).toHaveBeenCalledWith(courseId, WIDGETS.COURSE_OUTLINE);
    });

    it('closes sidebar when right panel is open but outline is collapsed', () => {
      isOutlineSidebarCollapsed.mockReturnValue(true);
      const params = buildParams({
        initialSidebar: WIDGETS.COURSE_OUTLINE,
        currentSidebar: 'DISCUSSIONS',
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).toHaveBeenCalledWith(null);
    });
  });

  describe('right panel sync (initialSidebar is a right panel)', () => {
    it('syncs current right panel to newly available initialSidebar', () => {
      const params = buildParams({
        initialSidebar: 'NOTES',
        currentSidebar: 'DISCUSSIONS',
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).toHaveBeenCalledWith('NOTES');
      expect(setSidebarId).toHaveBeenCalledWith(courseId, 'NOTES');
    });

    it('does NOT sync when currentSidebar is null (user closed it intentionally)', () => {
      const params = buildParams({
        initialSidebar: 'NOTES',
        currentSidebar: null,
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    });
  });

  describe('no right panels fallback (initialSidebar is null)', () => {
    it('opens COURSE_OUTLINE when current is a right panel and outline is not collapsed', () => {
      const params = buildParams({
        initialSidebar: null,
        currentSidebar: 'DISCUSSIONS',
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).toHaveBeenCalledWith(WIDGETS.COURSE_OUTLINE);
      expect(setSidebarId).toHaveBeenCalledWith(courseId, WIDGETS.COURSE_OUTLINE);
    });

    it('closes sidebar when right panel is current and outline is collapsed', () => {
      isOutlineSidebarCollapsed.mockReturnValue(true);
      const params = buildParams({
        initialSidebar: null,
        currentSidebar: 'DISCUSSIONS',
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).toHaveBeenCalledWith(null);
    });

    it('does nothing when initialSidebar is null and currentSidebar is null', () => {
      const params = buildParams({
        initialSidebar: null,
        currentSidebar: null,
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    });

    it('does nothing when initialSidebar is null and currentSidebar is COURSE_OUTLINE', () => {
      const params = buildParams({
        initialSidebar: null,
        currentSidebar: WIDGETS.COURSE_OUTLINE,
      });
      renderHook(() => useSidebarSync(params));

      expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    });
  });
});

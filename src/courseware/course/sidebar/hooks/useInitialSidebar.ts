import { useMemo } from 'react';
import { WIDGETS } from '@src/constants';
import {
  getSidebarId,
  isSidebarClosedByUser,
} from '../utils/storage';

interface Params {
  courseId: string;
  shouldDisplayFullScreen: boolean;
  isInitiallySidebarOpen: boolean;
  getFirstAvailablePanel: () => string | null;
}

/**
 * Calculate initial sidebar based on screen size and available widgets
 *
 * Manages ALL panels: DISCUSSIONS, UPGRADE, and COURSE_OUTLINE
 * DESKTOP (>1200px): Auto-opens the first available panel, in the order of the auxiliary sidebar slot
 * MOBILE (<1200px): Respects localStorage, no auto-open
 */
export function useInitialSidebar({
  courseId,
  shouldDisplayFullScreen,
  isInitiallySidebarOpen,
  getFirstAvailablePanel,
}: Params) {
  return useMemo<string | null>(() => {
    // MOBILE: Use stored value or null (no auto-open)
    if (shouldDisplayFullScreen) {
      return isSidebarClosedByUser() ? null : getSidebarId(courseId);
    }

    // DESKTOP: Auto-open if screen size allows
    if (!isInitiallySidebarOpen) {
      return null;
    }

    // User explicitly closed the sidebar this session — respect that
    if (isSidebarClosedByUser()) {
      return null;
    }

    const storedSidebar = getSidebarId(courseId);

    // Honor a stored RIGHT panel preference even before widget data has loaded.
    // Keeps initialSidebar stable across the async load window so downstream
    // effects don't briefly see COURSE_OUTLINE and overwrite storage.
    if (storedSidebar && storedSidebar !== WIDGETS.COURSE_OUTLINE) {
      // The first available panel, in the slot's order, opens whatever was stored: an earlier one takes over from
      // a later one, and from one that is gone. With none available yet, the stored choice stands.
      return getFirstAvailablePanel() ?? storedSidebar;
    }

    // Stored COURSE_OUTLINE or no stored preference: open the navigation sidebar.
    return WIDGETS.COURSE_OUTLINE;
  }, [
    shouldDisplayFullScreen,
    isInitiallySidebarOpen,
    courseId,
    getFirstAvailablePanel,
  ]);
}

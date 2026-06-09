import { useMemo } from 'react';
import { WIDGETS } from '@src/constants';
import {
  getSidebarId,
  isOutlineSidebarCollapsed,
  isSidebarClosedByUser,
} from '../utils/storage';

/**
 * Calculate initial sidebar based on screen size and available widgets
 *
 * Manages ALL panels: DISCUSSIONS, UPGRADE, and COURSE_OUTLINE
 * DESKTOP (>1200px): Auto-opens panels with priority cascade
 * MOBILE (<1200px): Respects localStorage, no auto-open
 *
 * @param {Object} params
 * @param {string} params.courseId - Current course ID
 * @param {boolean} params.shouldDisplayFullScreen - Whether in mobile view
 * @param {boolean} params.isInitiallySidebarOpen - Whether sidebar should be open
 * @param {Function} params.getFirstAvailablePanel - Get first available widget
 * @param {Function} params.getAvailableWidgets - Get all available widgets
 * @returns {string|null} Initial sidebar ID
 */
export function useInitialSidebar({
  courseId,
  shouldDisplayFullScreen,
  isInitiallySidebarOpen,
  getFirstAvailablePanel,
  getAvailableWidgets,
}) {
  return useMemo(() => {
    // Check if course outline is manually collapsed
    const isCollapsedOutline = isOutlineSidebarCollapsed();

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
      const firstAvailable = getFirstAvailablePanel();
      if (firstAvailable) {
        // Data is loaded — apply priority cascade if a higher-priority panel exists
        const availableWidgets = getAvailableWidgets();
        const storedWidget = availableWidgets.find(w => w.id === storedSidebar);
        const firstAvailableWidget = availableWidgets.find(w => w.id === firstAvailable);
        if (storedWidget && firstAvailableWidget && firstAvailableWidget.priority < storedWidget.priority) {
          return firstAvailable;
        }
      }
      return storedSidebar;
    }

    // Stored COURSE_OUTLINE: honor it (suppress only if collapsed this session)
    if (storedSidebar === WIDGETS.COURSE_OUTLINE) {
      return isCollapsedOutline ? null : WIDGETS.COURSE_OUTLINE;
    }

    // Default: open the navigation sidebar, not a RIGHT panel
    return isCollapsedOutline ? null : WIDGETS.COURSE_OUTLINE;
  }, [
    shouldDisplayFullScreen,
    isInitiallySidebarOpen,
    courseId,
    getFirstAvailablePanel,
    getAvailableWidgets,
  ]);
}

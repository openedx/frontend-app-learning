import { useMemo } from 'react';
import { WIDGETS } from '@src/constants';
import {
  getSidebarId,
  isOutlineSidebarCollapsed,
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
      return getSidebarId(courseId);
    }

    // DESKTOP: Auto-open if screen size allows
    if (!isInitiallySidebarOpen) {
      return null;
    }

    const firstAvailable = getFirstAvailablePanel();

    // If NO RIGHT panels available, return COURSE_OUTLINE (ignore localStorage)
    if (!firstAvailable) {
      return isCollapsedOutline ? null : WIDGETS.COURSE_OUTLINE;
    }

    // RIGHT panels ARE available - check stored preference
    const storedSidebar = getSidebarId(courseId);
    if (storedSidebar) {
      // Check if stored is a RIGHT panel that's still available
      const availableWidgets = getAvailableWidgets();
      const storedWidget = availableWidgets.find(w => w.id === storedSidebar);
      const firstAvailableWidget = availableWidgets.find(w => w.id === firstAvailable);

      if (storedWidget && storedWidget.id !== WIDGETS.COURSE_OUTLINE) {
        // Check priority: if a higher priority panel is now available, use it instead
        if (firstAvailableWidget && firstAvailableWidget.priority < storedWidget.priority) {
          // Higher priority panel available (lower number = higher priority)
          return firstAvailable;
        }
        // Stored RIGHT panel is still available and no higher priority - use it (sticky)
        return storedSidebar;
      }
      // If stored was COURSE_OUTLINE and not manually collapsed, prefer firstAvailable
      if (storedSidebar === WIDGETS.COURSE_OUTLINE && !isCollapsedOutline) {
        return firstAvailable;
      }
    }

    // Priority cascade: Use first available RIGHT panel
    return firstAvailable;
  }, [
    shouldDisplayFullScreen,
    isInitiallySidebarOpen,
    courseId,
    getFirstAvailablePanel,
    getAvailableWidgets,
  ]);
}

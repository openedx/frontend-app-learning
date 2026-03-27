import { useEffect } from 'react';
import { WIDGETS } from '@src/constants';
import {
  setSidebarId,
  isOutlineSidebarCollapsed,
} from '../utils/storage';

/**
 * Handle sidebar behavior when window resizes between mobile/desktop
 *
 * When resizing to desktop and no sidebar open, apply priority cascade:
 * - First available RIGHT panel (DISCUSSIONS or UPGRADE)
 * - Or COURSE_OUTLINE if no RIGHT panels available
 *
 * Respects user actions: Only applies auto-behavior if user hasn't manually toggled.
 *
 * @param {Object} params
 * @param {boolean} params.shouldDisplaySidebarOpen - Whether sidebar can be open
 * @param {string|null} params.currentSidebar - Currently active sidebar
 * @param {Function} params.setCurrentSidebar - Update current sidebar state
 * @param {Function} params.getFirstAvailablePanel - Get first available widget
 * @param {string} params.courseId - Current course ID
 * @param {Function} params.hasUserToggledRef - Ref tracking user manual toggles
 */
export function useResponsiveBehavior({
  shouldDisplaySidebarOpen,
  currentSidebar,
  setCurrentSidebar,
  getFirstAvailablePanel,
  courseId,
  hasUserToggledRef,
}) {
  useEffect(() => {
    // Skip if user has manually toggled within current unit (respect user action)
    if (hasUserToggledRef.current) {
      return;
    }

    // When resizing to desktop and no sidebar open, apply priority cascade
    if (shouldDisplaySidebarOpen && !currentSidebar) {
      const firstAvailable = getFirstAvailablePanel();
      if (firstAvailable) {
        setCurrentSidebar(firstAvailable);
        setSidebarId(courseId, firstAvailable);
      } else {
        // No RIGHT panels, open COURSE_OUTLINE if not manually collapsed
        const isCollapsedOutline = isOutlineSidebarCollapsed();
        if (!isCollapsedOutline) {
          setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
          setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
        }
      }
    }
  }, [shouldDisplaySidebarOpen, currentSidebar, getFirstAvailablePanel, courseId]);
}

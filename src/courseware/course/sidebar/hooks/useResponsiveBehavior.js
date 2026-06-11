import { useEffect } from 'react';
import { WIDGETS } from '@src/constants';
import {
  setSidebarId,
  isSidebarClosedByUser,
} from '../utils/storage';

/**
 * Handle sidebar behavior when window resizes between mobile/desktop
 *
 * When resizing to desktop and no sidebar open, recover to COURSE_OUTLINE (the default).
 *
 * Respects user actions: Only applies auto-behavior if user hasn't manually toggled.
 *
 * @param {Object} params
 * @param {boolean} params.shouldDisplaySidebarOpen - Whether sidebar can be open
 * @param {string|null} params.currentSidebar - Currently active sidebar
 * @param {Function} params.setCurrentSidebar - Update current sidebar state
 * @param {string} params.courseId - Current course ID
 * @param {Function} params.hasUserToggledRef - Ref tracking user manual toggles
 */
export function useResponsiveBehavior({
  shouldDisplaySidebarOpen,
  currentSidebar,
  setCurrentSidebar,
  courseId,
  hasUserToggledRef,
}) {
  useEffect(() => {
    // Skip if user has manually toggled within current unit (respect user action)
    if (hasUserToggledRef.current) {
      return;
    }

    // Skip if user has explicitly closed the sidebar this session
    if (isSidebarClosedByUser()) {
      return;
    }

    // When resizing to desktop and no sidebar open, recover to COURSE_OUTLINE.
    if (shouldDisplaySidebarOpen && !currentSidebar) {
      setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
      setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
    }
  }, [shouldDisplaySidebarOpen, currentSidebar, courseId]);
}

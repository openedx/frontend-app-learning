import { useEffect, type MutableRefObject } from 'react';
import { WIDGETS } from '@src/constants';
import {
  setSidebarId,
  isSidebarClosedByUser,
} from '../utils/storage';

interface Params {
  shouldDisplaySidebarOpen: boolean;
  currentSidebar: string | null;
  setCurrentSidebar: (sidebarId: string | null) => void;
  courseId: string;
  hasUserToggledRef: MutableRefObject<boolean>;
}

/**
 * Handle sidebar behavior when window resizes between mobile/desktop
 *
 * When resizing to desktop and no sidebar open, recover to COURSE_OUTLINE (the default).
 *
 * Respects user actions: Only applies auto-behavior if user hasn't manually toggled.
 */
export function useResponsiveBehavior({
  shouldDisplaySidebarOpen,
  currentSidebar,
  setCurrentSidebar,
  courseId,
  hasUserToggledRef,
}: Params) {
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

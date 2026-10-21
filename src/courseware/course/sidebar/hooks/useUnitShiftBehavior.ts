import { useEffect, type MutableRefObject } from 'react';
import { WIDGETS } from '@src/constants';
import {
  setSidebarId,
  isSidebarClosedByUser,
} from '../utils/storage';
import type { SidebarWidget } from '../SidebarContext';

interface Params {
  unitId: string;
  currentSidebar: string | null;
  setCurrentSidebar: (sidebarId: string | null) => void;
  getFirstAvailablePanel: () => string | null;
  getAvailableWidgets: () => SidebarWidget[];
  courseId: string;
  shouldDisplayFullScreen: boolean;
  shouldDisplaySidebarOpen: boolean;
  hasUserToggledRef: MutableRefObject<boolean>;
  previousUnitIdRef: MutableRefObject<string | null>;
  courseOutlineSetByUnitRef: MutableRefObject<string | null>;
  isInitialLoadRef: MutableRefObject<boolean>;
}

/**
 * Handle sidebar behavior when navigating between units
 *
 * Three scenarios (after the mobile + closed-by-user gates):
 * 1. COURSE_OUTLINE currently open → Keep it open (#2: nav stays open on advance)
 * 2. No RIGHT panels available → Keep the current RIGHT panel provisionally (data may
 *    still be loading); on a wide viewport with nothing open, recover to COURSE_OUTLINE
 * 3. RIGHT panels available → Apply priority cascade / fallback when current is stale;
 *    on a wide viewport with nothing open, recover to COURSE_OUTLINE (default);
 *    on a narrow viewport with nothing open, preserve null
 */
export function useUnitShiftBehavior({
  unitId,
  currentSidebar,
  setCurrentSidebar,
  getFirstAvailablePanel,
  getAvailableWidgets,
  courseId,
  shouldDisplayFullScreen,
  shouldDisplaySidebarOpen,
  hasUserToggledRef,
  previousUnitIdRef,
  courseOutlineSetByUnitRef,
  isInitialLoadRef,
}: Params) {
  useEffect(() => {
    // Detect unit change
    if (previousUnitIdRef.current !== unitId) {
      // eslint-disable-next-line no-param-reassign
      previousUnitIdRef.current = unitId;
      // eslint-disable-next-line no-param-reassign
      hasUserToggledRef.current = false; // Reset manual toggle flag on unit change

      // Mark that initial load is complete after first navigation
      const wasInitialLoad = isInitialLoadRef.current;
      if (isInitialLoadRef.current) {
        // eslint-disable-next-line no-param-reassign
        isInitialLoadRef.current = false;
      }

      // MOBILE: Persist state, no auto-switching
      if (shouldDisplayFullScreen) {
        return;
      }

      // User explicitly closed the sidebar — don't auto-open/switch on unit nav
      if (isSidebarClosedByUser()) {
        return;
      }

      // DESKTOP: Apply deterministic unit shift logic
      const firstAvailable = getFirstAvailablePanel();

      // CASE 1: COURSE_OUTLINE currently open — keep it open across unit nav
      if (currentSidebar === WIDGETS.COURSE_OUTLINE) {
        // eslint-disable-next-line no-param-reassign
        courseOutlineSetByUnitRef.current = wasInitialLoad ? null : unitId;
        return;
      }

      // CASE 2: No RIGHT panels available
      if (!firstAvailable) {
        // If current sidebar is a RIGHT panel, keep it open provisionally
        // (data might still be loading, sync effect will handle switching if needed)
        if (currentSidebar && currentSidebar !== WIDGETS.COURSE_OUTLINE) {
          // Keep current RIGHT panel open, let sync effect switch later if it becomes unavailable
          return;
        }

        // Open COURSE_OUTLINE as fallback on desktop; otherwise close
        if (shouldDisplaySidebarOpen) {
          setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
          setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
          // Only set flag on subsequent navigations, not initial load
          // eslint-disable-next-line no-param-reassign
          courseOutlineSetByUnitRef.current = wasInitialLoad ? null : unitId;
        } else {
          setCurrentSidebar(null);
          // eslint-disable-next-line no-param-reassign
          courseOutlineSetByUnitRef.current = null;
        }
        return;
      }

      // CASE 3: RIGHT panels ARE available
      if (currentSidebar) {
        // eslint-disable-next-line no-param-reassign
        courseOutlineSetByUnitRef.current = null; // RIGHT panel current, no outline auto-set
        const availableWidgets = getAvailableWidgets();
        const currentWidget = availableWidgets.find(w => w.id === currentSidebar);
        const firstAvailableWidget = availableWidgets.find(w => w.id === firstAvailable);

        // Check if higher priority panel is now available
        if (currentWidget && firstAvailableWidget && firstAvailableWidget.priority < currentWidget.priority) {
          // Higher priority panel available (lower number = higher priority) - switch to it
          setCurrentSidebar(firstAvailable);
          setSidebarId(courseId, firstAvailable);
        } else if (currentWidget) {
          // Current sidebar still valid at same priority — no state change needed
        } else {
          // Current panel not available - switch to first available RIGHT sidebar panel
          setCurrentSidebar(firstAvailable);
          setSidebarId(courseId, firstAvailable);
        }
      } else if (shouldDisplaySidebarOpen) {
        // currentSidebar=null on a wide viewport (and user hasn't explicitly closed) is
        // state drift — recover to the default (COURSE_OUTLINE) rather than auto-opening
        // a RIGHT panel.
        setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
        setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
        // eslint-disable-next-line no-param-reassign
        courseOutlineSetByUnitRef.current = wasInitialLoad ? null : unitId;
      }
      // currentSidebar=null on a narrow viewport: preserve null.
    }
  }, [
    unitId,
    currentSidebar,
    setCurrentSidebar,
    getFirstAvailablePanel,
    getAvailableWidgets,
    courseId,
    shouldDisplayFullScreen,
    shouldDisplaySidebarOpen,
  ]);
}

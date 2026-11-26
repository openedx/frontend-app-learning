import { useEffect, type MutableRefObject } from 'react';
import { WIDGETS } from '@src/constants';
import {
  setSidebarId,
  isSidebarClosedByUser,
} from '../utils/storage';

interface Params {
  unitId: string;
  currentSidebar: string | null;
  setCurrentSidebar: (sidebarId: string | null) => void;
  getFirstAvailablePanel: () => string | null;
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
 * 3. RIGHT panels available → The first one, in the slot's order, takes over from a later or a stale one;
 *    on a wide viewport with nothing open, recover to COURSE_OUTLINE (default);
 *    on a narrow viewport with nothing open, preserve null
 */
export function useUnitShiftBehavior({
  unitId,
  currentSidebar,
  setCurrentSidebar,
  getFirstAvailablePanel,
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
      previousUnitIdRef.current = unitId;
      hasUserToggledRef.current = false; // Reset manual toggle flag on unit change

      // Mark that initial load is complete after first navigation
      const wasInitialLoad = isInitialLoadRef.current;
      if (isInitialLoadRef.current) {
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
          courseOutlineSetByUnitRef.current = wasInitialLoad ? null : unitId;
        } else {
          setCurrentSidebar(null);
          courseOutlineSetByUnitRef.current = null;
        }
        return;
      }

      // CASE 3: RIGHT panels ARE available
      if (currentSidebar) {
        courseOutlineSetByUnitRef.current = null; // RIGHT panel current, no outline auto-set
        // The first available panel, in the slot's order, takes over from a later one, and from one that is no
        // longer available. The first one itself stays as it is.
        if (currentSidebar !== firstAvailable) {
          setCurrentSidebar(firstAvailable);
          setSidebarId(courseId, firstAvailable);
        }
      } else if (shouldDisplaySidebarOpen) {
        // currentSidebar=null on a wide viewport (and user hasn't explicitly closed) is
        // state drift — recover to the default (COURSE_OUTLINE) rather than auto-opening
        // a RIGHT panel.
        setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
        setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
        courseOutlineSetByUnitRef.current = wasInitialLoad ? null : unitId;
      }
      // currentSidebar=null on a narrow viewport: preserve null.
    }
    // The refs are stable; the legacy app listed only the values that change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    unitId,
    currentSidebar,
    setCurrentSidebar,
    getFirstAvailablePanel,
    courseId,
    shouldDisplayFullScreen,
    shouldDisplaySidebarOpen,
  ]);
}

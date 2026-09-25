import { useEffect, type MutableRefObject } from 'react';
import { WIDGETS } from '@src/constants';
import {
  setSidebarId,
  isSidebarClosedByUser,
} from '../utils/storage';

interface Params {
  initialSidebar: string | null;
  currentSidebar: string | null;
  setCurrentSidebar: (sidebarId: string | null) => void;
  courseId: string;
  unitId: string;
  shouldDisplayFullScreen: boolean;
  hasUserToggledRef: MutableRefObject<boolean>;
  courseOutlineSetByUnitRef: MutableRefObject<string | null>;
}

/**
 * Sync currentSidebar with initialSidebar when async data loads
 *
 * sync currentSidebar with the updated initialSidebar (priority cascade).
 *
 * Respects user actions: Only syncs if user hasn't manually toggled in current unit.
 */
export function useSidebarSync({
  initialSidebar,
  currentSidebar,
  setCurrentSidebar,
  courseId,
  unitId,
  shouldDisplayFullScreen,
  hasUserToggledRef,
  courseOutlineSetByUnitRef,
}: Params) {
  useEffect(() => {
    // Skip if on mobile
    if (shouldDisplayFullScreen) {
      return;
    }

    // Skip if user has manually toggled within current unit (respect user action)
    if (hasUserToggledRef.current) {
      return;
    }

    // Skip if COURSE_OUTLINE was just set by unit navigation (not initial load)
    // On initial load, allow data to trigger switching from COURSE_OUTLINE to RIGHT panels
    if (
      currentSidebar === WIDGETS.COURSE_OUTLINE
      && courseOutlineSetByUnitRef.current === unitId
    ) {
      return;
    }

    // If initialSidebar changed and current doesn't match, sync them
    if (initialSidebar && currentSidebar !== initialSidebar) {
      // Handle COURSE_OUTLINE separately
      if (initialSidebar === WIDGETS.COURSE_OUTLINE) {
        // initialSidebar is COURSE_OUTLINE because storage says so (or nothing is stored)
        if (currentSidebar === null) {
          // Nothing open - open COURSE_OUTLINE unless the user has explicitly closed
          if (!isSidebarClosedByUser()) {
            setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
            setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
          }
        } else if (currentSidebar && currentSidebar !== WIDGETS.COURSE_OUTLINE) {
          // A RIGHT panel is currently open, but storage now says COURSE_OUTLINE — sync to it.
          if (!isSidebarClosedByUser()) {
            setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
            setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
          } else {
            setCurrentSidebar(null);
          }
        }
      } else if (currentSidebar !== null) {
        // initialSidebar is a RIGHT panel (DISCUSSIONS or WIDGETS)
        // Only switch if current is also a panel (not null - user might have closed it)
        setCurrentSidebar(initialSidebar);
        setSidebarId(courseId, initialSidebar);
      }
    } else if (!initialSidebar && currentSidebar && currentSidebar !== WIDGETS.COURSE_OUTLINE) {
      // initialSidebar is null but a RIGHT panel is currently open — sync by opening
      // COURSE_OUTLINE, or closing if the user has explicitly closed the sidebar.
      if (!isSidebarClosedByUser()) {
        setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
        setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
      } else {
        setCurrentSidebar(null);
      }
    }
  }, [initialSidebar, currentSidebar, shouldDisplayFullScreen, courseId, unitId]);
}

import { useEffect } from 'react';
import { WIDGETS } from '@src/constants';
import {
  setSidebarId,
  isOutlineSidebarCollapsed,
} from '../utils/storage';

/**
 * Sync currentSidebar with initialSidebar when async data loads
 *
 * sync currentSidebar with the updated initialSidebar (priority cascade).
 *
 * Respects user actions: Only syncs if user hasn't manually toggled in current unit.
 *
 * @param {Object} params
 * @param {string|null} params.initialSidebar - Calculated initial sidebar
 * @param {string|null} params.currentSidebar - Currently active sidebar
 * @param {Function} params.setCurrentSidebar - Update current sidebar state
 * @param {string} params.courseId - Current course ID
 * @param {string} params.unitId - Current unit ID
 * @param {boolean} params.shouldDisplayFullScreen - Whether in mobile view
 * @param {Object} params.hasUserToggledRef - Ref tracking user manual toggles
 * @param {Object} params.courseOutlineSetByUnitRef - Ref tracking COURSE_OUTLINE auto-set
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
}) {
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
        // COURSE_OUTLINE should be open (no RIGHT panels available)
        if (currentSidebar === null) {
          // Nothing open - open COURSE_OUTLINE if not manually collapsed
          const isCollapsedOutline = isOutlineSidebarCollapsed();
          if (!isCollapsedOutline) {
            setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
            setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
          }
        } else if (currentSidebar && currentSidebar !== WIDGETS.COURSE_OUTLINE) {
          // A RIGHT panel is currently open, but initialSidebar says COURSE_OUTLINE should be open
          // This means NO RIGHT panels are available - switch to COURSE_OUTLINE
          const isCollapsedOutline = isOutlineSidebarCollapsed();
          if (!isCollapsedOutline) {
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
      // If initialSidebar is now null (no RIGHT panels) and current is a RIGHT panel
      // Open COURSE_OUTLINE as fallback
      const isCollapsedOutline = isOutlineSidebarCollapsed();
      if (!isCollapsedOutline) {
        setCurrentSidebar(WIDGETS.COURSE_OUTLINE);
        setSidebarId(courseId, WIDGETS.COURSE_OUTLINE);
      } else {
        setCurrentSidebar(null);
      }
    }
  }, [initialSidebar, currentSidebar, shouldDisplayFullScreen, courseId, unitId]);
}

import { useEffect } from 'react';
import { WIDGETS } from '@src/constants';
import {
  setSidebarId,
  isSidebarClosedByUser,
} from '../utils/storage';

/**
 * Handle sidebar behavior when navigating between units
 *
 * Three scenarios:
 * 1. COURSE_OUTLINE currently open → Switch to RIGHT panel if available, else keep open
 * 2. No RIGHT panels available → Open COURSE_OUTLINE (if not collapsed) or keep current provisionally
 * 3. RIGHT panels available → Switch based on priority cascade, maintaining sticky behavior
 *
 * @param {Object} params
 * @param {string} params.unitId - Current unit ID
 * @param {string|null} params.currentSidebar - Currently active sidebar
 * @param {Function} params.setCurrentSidebar - Update current sidebar state
 * @param {Function} params.getFirstAvailablePanel - Get first available widget
 * @param {Function} params.getAvailableWidgets - Get all available widgets
 * @param {string} params.courseId - Current course ID
 * @param {boolean} params.shouldDisplayFullScreen - Whether in mobile view
 * @param {boolean} params.shouldDisplaySidebarOpen - Whether sidebar can be open
 * @param {Object} params.hasUserToggledRef - Ref tracking user manual toggles
 * @param {Object} params.previousUnitIdRef - Ref tracking previous unit ID
 * @param {Object} params.courseOutlineSetByUnitRef - Ref tracking COURSE_OUTLINE auto-set
 * @param {Object} params.isInitialLoadRef - Ref tracking if this is initial load
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
}) {
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

      // CASE 1: COURSE_OUTLINE currently open
      if (currentSidebar === WIDGETS.COURSE_OUTLINE) {
        if (firstAvailable) {
          // RIGHT panel available - switch from COURSE_OUTLINE to it (priority cascade)
          setCurrentSidebar(firstAvailable);
          setSidebarId(courseId, firstAvailable);
          // eslint-disable-next-line no-param-reassign
          courseOutlineSetByUnitRef.current = null; // Clear flag
        } else {
          // Keep COURSE_OUTLINE open, mark that this unit has it
          // eslint-disable-next-line no-param-reassign
          courseOutlineSetByUnitRef.current = wasInitialLoad ? null : unitId;
        }
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
      // eslint-disable-next-line no-param-reassign
      courseOutlineSetByUnitRef.current = null; // Clear flag when RIGHT panels available
      if (currentSidebar) {
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
        // No panel was open on desktop - auto-open first available
        setCurrentSidebar(firstAvailable);
        setSidebarId(courseId, firstAvailable);
      }
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

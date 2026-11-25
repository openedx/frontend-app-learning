import { breakpoints, useWindowSize } from '@openedx/paragon';
import {
  useState, useMemo, useCallback, useRef, type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import {
  useCoursewareMetadata, useDiscussionTopic, useMinimalCourseOutline,
} from '@src/courseware/data/apiHooks';

import { buildWidgetCourse, useAuxiliarySidebarWidgets } from './auxiliarySidebarWidgets';
import {
  setSidebarId,
  setSidebarClosedByUser,
} from './utils/storage';
import {
  useInitialSidebar,
  useUnitShiftBehavior,
  useSidebarSync,
  useResponsiveBehavior,
} from './hooks';
import { SidebarContext, type SidebarContextValue } from './useSidebar';

export type {
  AuxiliarySidebarWidgetOptions, SidebarAvailabilityContext, SidebarWidget,
} from './auxiliarySidebarWidgets';
export { useSidebar, type SidebarContextValue } from './useSidebar';

interface Props {
  courseId: string;
  unitId: string;
  children?: ReactNode;
}

// The sidebar widgets come from the auxiliary sidebar slot: its panels, and the options set on them.
export const SidebarProvider = ({
  courseId,
  unitId,
  children,
}: Props) => {
  const widgets = useAuxiliarySidebarWidgets();
  const courseHomeMeta = useCourseHomeMeta(courseId, { enabled: false }).data;
  const coursewareMetadata = useCoursewareMetadata(courseId, { enabled: false }).data;
  const minimalCourseMetadata = useMinimalCourseOutline(courseId, { enabled: false }).data?.courses[courseId];
  const unit = useDiscussionTopic(courseId, unitId).data;
  const width = useWindowSize().width ?? window.innerWidth;
  const shouldDisplayFullScreen = width < breakpoints.extraLarge.minWidth!;
  const shouldDisplaySidebarOpen = width > breakpoints.extraLarge.minWidth!;
  const [searchParams] = useSearchParams();
  const isInitiallySidebarOpen = shouldDisplaySidebarOpen || searchParams.get('sidebar') === 'true';

  // Helper to get available widgets based on current context
  const getAvailableWidgets = useCallback(() => {
    const context = {
      courseId,
      unitId,
      course: buildWidgetCourse(coursewareMetadata, minimalCourseMetadata, courseHomeMeta),
      unit,
    };
    return widgets.filter(widget => {
      if (widget.isAvailable) {
        return widget.isAvailable(context);
      }
      return true; // If no isAvailable function, widget is always available
    });
  }, [widgets, courseId, unitId, coursewareMetadata, minimalCourseMetadata, courseHomeMeta, unit]);

  // Helper to get the first available panel, in the order of the auxiliary sidebar slot
  const getFirstAvailablePanel = useCallback(() => {
    const availableWidgets = getAvailableWidgets();
    return availableWidgets[0]?.id || null;
  }, [getAvailableWidgets]);

  // Calculate initial sidebar: the first available panel, else the stored one, else the course outline
  const initialSidebar = useInitialSidebar({
    courseId,
    shouldDisplayFullScreen,
    isInitiallySidebarOpen,
    getFirstAvailablePanel,
  });

  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);

  // Track if user has manually toggled sidebar within current unit
  const hasUserToggledRef = useRef(false);
  const previousUnitIdRef = useRef<string | null>(null); // Start null so first render triggers unit shift logic
  // Track which unit set COURSE_OUTLINE (to prevent immediate switching)
  const courseOutlineSetByUnitRef = useRef<string | null>(null);
  // Track if this is initial page load (to allow data loading switches)
  const isInitialLoadRef = useRef(true);

  // Apply unit navigation behavior
  useUnitShiftBehavior({
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
  });

  // Sync with async data loading
  useSidebarSync({
    initialSidebar,
    currentSidebar,
    setCurrentSidebar,
    courseId,
    unitId,
    shouldDisplayFullScreen,
    hasUserToggledRef,
    courseOutlineSetByUnitRef,
  });

  // Handle responsive behavior
  useResponsiveBehavior({
    shouldDisplaySidebarOpen,
    currentSidebar,
    setCurrentSidebar,
    courseId,
    hasUserToggledRef,
  });

  const availableSidebarIds = useMemo(
    () => getAvailableWidgets().map(w => w.id),
    [getAvailableWidgets],
  );

  const toggleSidebar = useCallback((sidebarId: string | null) => {
    // Mark that user has manually interacted with sidebar
    hasUserToggledRef.current = true;

    // Switch to new sidebar or hide the current sidebar
    const newSidebar = sidebarId === currentSidebar ? null : sidebarId;
    setCurrentSidebar(newSidebar);
    setSidebarId(courseId, newSidebar);
    setSidebarClosedByUser(newSidebar === null);
  }, [currentSidebar, courseId]);

  const contextValue = useMemo<SidebarContextValue>(() => ({
    initialSidebar,
    toggleSidebar,
    currentSidebar,
    shouldDisplaySidebarOpen,
    shouldDisplayFullScreen,
    courseId,
    unitId,
    availableSidebarIds,
  }), [
    initialSidebar,
    toggleSidebar,
    currentSidebar,
    shouldDisplaySidebarOpen,
    shouldDisplayFullScreen,
    courseId,
    unitId,
    availableSidebarIds,
  ]);
  const renderWithWidgetProviders = useCallback((content: ReactNode) => widgets
    .reduceRight((acc, { Provider }) => (Provider ? <Provider>{acc}</Provider> : acc), content), [widgets]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {renderWithWidgetProviders(children)}
    </SidebarContext.Provider>
  );
};

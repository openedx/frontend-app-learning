import { breakpoints, useWindowSize } from '@openedx/paragon';
import {
  useState, useMemo, useCallback, useRef, type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useModel } from '@src/generic/model-store';

import SidebarContext, { type SidebarContextValue, type SidebarWidget } from './SidebarContext';
import {
  getEnabledWidgets,
  buildSidebarsRegistry,
  getSidebarOrder,
} from './defaultWidgets';
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

interface Props {
  courseId: string;
  unitId: string;
  children?: ReactNode;
}

const SidebarProvider = ({
  courseId,
  unitId,
  children,
}: Props) => {
  const courseHomeMeta = useCourseHomeMeta(courseId, { enabled: false }).data;
  const coursewareMeta = useModel('coursewareMeta', courseId);
  const unit = useModel('discussionTopics', unitId);
  const width = useWindowSize().width ?? window.innerWidth;
  const shouldDisplayFullScreen = width < breakpoints.extraLarge.minWidth!;
  const shouldDisplaySidebarOpen = width > breakpoints.extraLarge.minWidth!;
  const [searchParams] = useSearchParams();
  const isInitiallySidebarOpen = shouldDisplaySidebarOpen || searchParams.get('sidebar') === 'true';

  // Build registry of enabled widgets
  const enabledWidgets = useMemo<SidebarWidget[]>(() => getEnabledWidgets(), []);
  const SIDEBARS = useMemo(() => buildSidebarsRegistry(enabledWidgets), [enabledWidgets]);
  const SIDEBAR_ORDER = useMemo(() => getSidebarOrder(enabledWidgets), [enabledWidgets]);

  // Helper to get available widgets based on current context
  const getAvailableWidgets = useCallback(() => {
    const context = {
      courseId,
      unitId,
      course: { ...coursewareMeta, ...courseHomeMeta },
      unit,
    };
    return enabledWidgets.filter(widget => {
      if (widget.isAvailable) {
        return widget.isAvailable(context);
      }
      return true; // If no isAvailable function, widget is always available
    });
  }, [enabledWidgets, courseId, unitId, coursewareMeta, courseHomeMeta, unit]);

  // Helper to get the first available panel based on priority
  const getFirstAvailablePanel = useCallback(() => {
    const availableWidgets = getAvailableWidgets();
    // Return the first available widget (highest priority = lowest priority number)
    return availableWidgets[0]?.id || null;
  }, [getAvailableWidgets]);

  // Calculate initial sidebar with priority cascade
  const initialSidebar = useInitialSidebar({
    courseId,
    shouldDisplayFullScreen,
    isInitiallySidebarOpen,
    getFirstAvailablePanel,
    getAvailableWidgets,
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
    getAvailableWidgets,
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

  const toggleSidebar = useCallback((sidebarId: string) => {
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
    SIDEBARS,
    SIDEBAR_ORDER,
    availableSidebarIds,
  }), [
    initialSidebar,
    toggleSidebar,
    currentSidebar,
    shouldDisplaySidebarOpen,
    shouldDisplayFullScreen,
    courseId,
    unitId,
    SIDEBARS,
    SIDEBAR_ORDER,
    availableSidebarIds,
  ]);
  const renderWithWidgetProviders = useCallback((content: ReactNode) => enabledWidgets
    .reduceRight((acc, { Provider }) => (Provider ? <Provider>{acc}</Provider> : acc), content), [enabledWidgets]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {renderWithWidgetProviders(children)}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;

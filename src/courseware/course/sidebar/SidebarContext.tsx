import { breakpoints, useWindowSize } from '@openedx/paragon';
import {
  createContext, useContext, useState, useMemo, useCallback, useRef, type ComponentType, type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useCourseHomeMeta, type CourseHomeMeta } from '@src/course-home/data/apiHooks';
import type { CoursewareMeta, DiscussionTopic } from '@src/courseware/data/apiHooks';
import { useModel } from '@src/generic/model-store';

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

export interface SidebarWidgetContext {
  courseId: string;
  unitId: string;
  course: CourseHomeMeta & CoursewareMeta;
  unit: Partial<DiscussionTopic>;
}

export interface SidebarWidget {
  id: string;
  priority: number;
  Sidebar: ComponentType;
  Trigger: ComponentType<{ onClick: () => void }>;
  Provider?: ComponentType<{ children: ReactNode }>;
  isAvailable?: (context: SidebarWidgetContext) => boolean;
  enabled?: boolean;
}

export interface SidebarRegistryEntry {
  ID: string;
  Sidebar: ComponentType;
  Trigger: ComponentType<{ onClick: () => void }>;
  isAvailable?: (context: SidebarWidgetContext) => boolean;
}

export interface SidebarContextValue {
  currentSidebar: string | null;
  initialSidebar: string | null;
  toggleSidebar: (sidebarId: string | null) => void;
  shouldDisplaySidebarOpen: boolean;
  shouldDisplayFullScreen: boolean;
  courseId: string;
  unitId: string;
  SIDEBARS: Record<string, SidebarRegistryEntry>;
  SIDEBAR_ORDER: string[];
  availableSidebarIds: string[];
}

export const buildSidebarsRegistry = (widgets: SidebarWidget[]): Record<string, SidebarRegistryEntry> => (
  Object.fromEntries(widgets.map(widget => [widget.id, {
    ID: widget.id,
    Sidebar: widget.Sidebar,
    Trigger: widget.Trigger,
    isAvailable: widget.isAvailable,
  }]))
);

export const getSidebarOrder = (widgets: SidebarWidget[]): string[] => widgets.map(widget => widget.id);

const SidebarContext = createContext<SidebarContextValue | null>(null);

interface Props {
  courseId: string;
  unitId: string;
  widgets: SidebarWidget[];
  children?: ReactNode;
}

export const SidebarProvider = ({
  courseId,
  unitId,
  widgets,
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

  const SIDEBARS = useMemo(() => buildSidebarsRegistry(widgets), [widgets]);
  const SIDEBAR_ORDER = useMemo(() => getSidebarOrder(widgets), [widgets]);

  // Helper to get available widgets based on current context
  const getAvailableWidgets = useCallback(() => {
    const context = {
      courseId,
      unitId,
      course: { ...coursewareMeta, ...courseHomeMeta },
      unit,
    };
    return widgets.filter(widget => {
      if (widget.isAvailable) {
        return widget.isAvailable(context);
      }
      return true; // If no isAvailable function, widget is always available
    });
  }, [widgets, courseId, unitId, coursewareMeta, courseHomeMeta, unit]);

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
  const renderWithWidgetProviders = useCallback((content: ReactNode) => widgets
    .reduceRight((acc, { Provider }) => (Provider ? <Provider>{acc}</Provider> : acc), content), [widgets]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {renderWithWidgetProviders(children)}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

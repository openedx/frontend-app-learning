import { breakpoints, useWindowSize } from '@openedx/paragon';
import PropTypes from 'prop-types';
import {
  useState, useMemo, useCallback, useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useModel } from '@src/generic/model-store';

import SidebarContext from './SidebarContext';
import {
  getEnabledWidgets,
  buildSidebarsRegistry,
  getSidebarOrder,
} from './defaultWidgets';
import {
  setSidebarId,
} from './utils/storage';
import {
  useInitialSidebar,
  useUnitShiftBehavior,
  useSidebarSync,
  useResponsiveBehavior,
} from './hooks';

const SidebarProvider = ({
  courseId,
  unitId,
  children,
}) => {
  const courseHomeMeta = useModel('courseHomeMeta', courseId);
  const coursewareMeta = useModel('coursewareMeta', courseId);
  const unit = useModel('discussionTopics', unitId);
  const { width } = useWindowSize();
  const shouldDisplayFullScreen = width < breakpoints.extraLarge.minWidth;
  const shouldDisplaySidebarOpen = width > breakpoints.extraLarge.minWidth;
  const [searchParams] = useSearchParams();
  const isInitiallySidebarOpen = shouldDisplaySidebarOpen || searchParams.get('sidebar') === 'true';

  // Build registry of enabled widgets
  const enabledWidgets = useMemo(() => getEnabledWidgets(), []);
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
  const previousUnitIdRef = useRef(null); // Start null so first render triggers unit shift logic
  // Track which unit set COURSE_OUTLINE (to prevent immediate switching)
  const courseOutlineSetByUnitRef = useRef(null);
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
    getFirstAvailablePanel,
    courseId,
    hasUserToggledRef,
  });

  const availableSidebarIds = useMemo(
    () => getAvailableWidgets().map(w => w.id),
    [getAvailableWidgets],
  );

  const toggleSidebar = useCallback((sidebarId) => {
    // Mark that user has manually interacted with sidebar
    hasUserToggledRef.current = true;

    // Switch to new sidebar or hide the current sidebar
    const newSidebar = sidebarId === currentSidebar ? null : sidebarId;
    setCurrentSidebar(newSidebar);
    setSidebarId(courseId, newSidebar);
  }, [currentSidebar, courseId]);

  const contextValue = useMemo(() => ({
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
  const renderWithWidgetProviders = useCallback((content) => enabledWidgets
    .filter(w => w.Provider)
    .reduceRight((acc, widget) => {
      const { Provider } = widget;
      return <Provider>{acc}</Provider>;
    }, content), [enabledWidgets]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {renderWithWidgetProviders(children)}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

SidebarProvider.defaultProps = {
  children: null,
};

export default SidebarProvider;

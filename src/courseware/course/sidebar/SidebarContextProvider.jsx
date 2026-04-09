import { breakpoints, useWindowSize } from '@openedx/paragon';
import PropTypes from 'prop-types';
import {
  useState, useMemo, useCallback, useRef, useEffect,
} from 'react';
import { useDispatch } from 'react-redux';
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

  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const shouldDisplayFullScreen = width < breakpoints.extraLarge.minWidth;
  const shouldDisplaySidebarOpen = width > breakpoints.extraLarge.minWidth;
  const [searchParams] = useSearchParams();
  const isInitiallySidebarOpen = shouldDisplaySidebarOpen || searchParams.get('sidebar') === 'true';

  // Build registry of enabled widgets
  const enabledWidgets = useMemo(() => getEnabledWidgets(), []);

  useEffect(() => {
    enabledWidgets.forEach(widget => widget.prefetch?.({
      courseId, course: { ...coursewareMeta, ...courseHomeMeta }, dispatch,
    }));
  }, [courseId, courseHomeMeta, coursewareMeta, enabledWidgets, dispatch]);

  const SIDEBARS = useMemo(() => buildSidebarsRegistry(enabledWidgets), [enabledWidgets]);
  const SIDEBAR_ORDER = useMemo(() => getSidebarOrder(enabledWidgets), [enabledWidgets]);

  // Helper to get available widgets based on current context
  const getAvailableWidgets = useCallback(() => {
    const context = {
      courseId,
      unitId,
      course: { ...coursewareMeta, ...courseHomeMeta },
    };
    return enabledWidgets.filter(widget => {
      if (widget.isAvailable) {
        return widget.isAvailable(context);
      }
      return true;
    });
  }, [enabledWidgets, courseId, unitId, coursewareMeta, courseHomeMeta]);

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

  const hasUserToggledRef = useRef(false);
  const previousUnitIdRef = useRef(null);
  const courseOutlineSetByUnitRef = useRef(null);
  const isInitialLoadRef = useRef(true);

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

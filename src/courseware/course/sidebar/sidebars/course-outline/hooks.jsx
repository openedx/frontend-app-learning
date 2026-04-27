import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';

import { useModel } from '@src/generic/model-store';
import { LOADED } from '@src/constants';
import { checkBlockCompletion, getCourseOutlineStructure, hydrateOutlineEffortData } from '@src/courseware/data/thunks';
import OldSidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import NewSidebarContext from '@src/courseware/course/new-sidebar/SidebarContext';
import {
  getCoursewareOutlineSidebarSettings,
  getCourseOutlineShouldUpdate,
  getCourseOutlineStatus,
  getSequenceId,
  getCourseOutline,
  getSequenceStatus,
} from '@src/courseware/data/selectors';
import { ID } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const useCourseOutlineSidebar = () => {
  const dispatch = useDispatch();
  const isCollapsedOutlineSidebar = window.sessionStorage.getItem('hideCourseOutlineSidebar');
  const { enableNavigationSidebar: isEnabledSidebar } = useSelector(getCoursewareOutlineSidebarSettings);
  const courseOutlineShouldUpdate = useSelector(getCourseOutlineShouldUpdate);
  const courseOutlineStatus = useSelector(getCourseOutlineStatus);
  const sequenceStatus = useSelector(getSequenceStatus);
  const activeSequenceId = useSelector(getSequenceId);
  // Selectors to get the course outline data from the store
  const {
    courses = {},
    sections = {},
    sequences = {},
    units = {},
  } = useSelector(getCourseOutline);
  const modelSequences = useSelector(state => state.models?.sequences || {});
  const modelUnits = useSelector(state => state.models?.units || {});

  const { courseId } = useParams();
  const course = useModel('coursewareMeta', courseId);
  const { isNewDiscussionSidebarViewEnabled } = useModel('courseHomeMeta', courseId);
  const SidebarContext = isNewDiscussionSidebarViewEnabled ? NewSidebarContext : OldSidebarContext;

  const {
    unitId,
    initialSidebar,
    currentSidebar,
    toggleSidebar,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);

  const isOpenSidebar = !initialSidebar && isEnabledSidebar && !isCollapsedOutlineSidebar;
  const [isOpen, setIsOpen] = useState(true);
  // Local state to track whether effort data has been hydrated to prevent unnecessary hydration calls
  const [isEffortHydrated, setIsEffortHydrated] = useState(false);

  const {
    entranceExamEnabled,
    entranceExamPassed,
  } = course.entranceExamData || {};
  const isActiveEntranceExam = entranceExamEnabled && !entranceExamPassed;
  const rootCourseId = Object.keys(courses)[0];
  // Determine whether to show estimated time in the sidebar based on the course setting, defaulting to true if the setting is not defined
  const showOutlineEstimatedTime = rootCourseId
    ? courses[rootCourseId]?.showEstimatedTime !== false
    : true;

  const handleToggleCollapse = () => {
    if (currentSidebar === ID) {
      toggleSidebar(null);
      window.sessionStorage.setItem('hideCourseOutlineSidebar', 'true');
    } else {
      toggleSidebar(ID);
      window.sessionStorage.removeItem('hideCourseOutlineSidebar');
    }
  };

  const handleUnitClick = ({ sequenceId, activeUnitId, id }) => {
    const logEvent = (eventName, widgetPlacement) => {
      const findSequenceByUnitId = () => Object.values(sequences).find(seq => seq.unitIds.includes(activeUnitId));
      const activeSequence = findSequenceByUnitId(activeUnitId);
      const targetSequence = findSequenceByUnitId(id);
      const payload = {
        id: activeUnitId,
        current_tab: activeSequence.unitIds.indexOf(activeUnitId) + 1,
        tab_count: activeSequence.unitIds.length,
        target_id: id,
        target_tab: targetSequence.unitIds.indexOf(id) + 1,
        widget_placement: widgetPlacement,
      };

      if (activeSequence.id !== targetSequence.id) {
        payload.target_tab_count = targetSequence.unitIds.length;
      }

      sendTrackEvent(eventName, payload);
      sendTrackingLogEvent(eventName, payload);
    };

    logEvent('edx.ui.lms.sequence.tab_selected', 'left');
    dispatch(checkBlockCompletion(courseId, sequenceId, activeUnitId));

    // Hide the sidebar after selecting a unit on a mobile device.
    if (shouldDisplayFullScreen) {
      handleToggleCollapse();
    }
  };

  useEffect(() => {
    if (isOpenSidebar && currentSidebar !== ID) {
      toggleSidebar(ID);
    }
  }, [initialSidebar, unitId]);

  useEffect(() => {
    if ((isEnabledSidebar && courseOutlineStatus !== LOADED) || courseOutlineShouldUpdate) {
      dispatch(getCourseOutlineStructure(courseId));
    }
  }, [courseId, isEnabledSidebar, courseOutlineShouldUpdate]);

  // Reset effort hydration state when courseId changes to ensure effort data is hydrated for the new course
  useEffect(() => {
    setIsEffortHydrated(false);
  }, [courseId]);

  // Hydrate effort data for the course outline when the outline is loaded and effort data has not yet been hydrated
  useEffect(() => {
    if (!isEnabledSidebar || courseOutlineStatus !== LOADED || isEffortHydrated) {
      return;
    }

  // Get all sequence IDs from the course outline to hydrate effort data for each sequence.
    const allSequenceIds = Object.keys(sequences);
    if (allSequenceIds.length === 0) {
      setIsEffortHydrated(true);
      return;
    }

    // Dispatch the hydrateOutlineEffortData thunk to calculate and store effort data for each sequence in the course outline
    dispatch(hydrateOutlineEffortData(allSequenceIds));
    setIsEffortHydrated(true);
  }, [courseOutlineStatus, dispatch, isEffortHydrated, isEnabledSidebar, sequences]);

  return {
    courseId,
    unitId,
    currentSidebar,
    shouldDisplayFullScreen,
    isEnabledSidebar,
    isOpen,
    setIsOpen,
    handleToggleCollapse,
    isActiveEntranceExam,
    courseOutlineStatus,
    activeSequenceId,
    sections,
    sequences,
    units,
    // Pass model data to be accessed in the SidebarSection, SidebarSequence, and SidebarUnit components for effort time calculations
    showOutlineEstimatedTime,
    modelSequences,
    modelUnits,
    handleUnitClick,
    sequenceStatus,
  };
};

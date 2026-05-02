import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { breakpoints } from '@openedx/paragon';
import { LOADED } from '@src/constants';
import {
  getCourseOutline,
  getCourseOutlineShouldUpdate,
  getCourseOutlineStatus,
  getCoursewareOutlineSidebarSettings,
  getSequenceId,
  getSequenceStatus,
} from '@src/courseware/data/selectors';
import { checkBlockCompletion, getCourseOutlineStructure } from '@src/courseware/data/thunks';

import { useModel } from '@src/generic/model-store';
import {
  useContext, useEffect, useLayoutEffect, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import SidebarContext from '../../SidebarContext';
import { setOutlineSidebarCollapsed } from '../../utils/storage';
import { ID } from './constants';

export const useCourseOutlineData = () => {
  const dispatch = useDispatch();
  const {
    enableCompletionTracking: isEnabledCompletionTracking,
  } = useSelector(getCoursewareOutlineSidebarSettings);
  const courseOutlineShouldUpdate = useSelector(getCourseOutlineShouldUpdate);
  const courseOutlineStatus = useSelector(getCourseOutlineStatus);
  const sequenceStatus = useSelector(getSequenceStatus);
  const activeSequenceId = useSelector(getSequenceId);
  const {
    sections = {},
    sequences = {},
    units = {},
  } = useSelector(getCourseOutline);

  const { courseId } = useParams();
  const course = useModel('coursewareMeta', courseId);

  const {
    entranceExamEnabled,
    entranceExamPassed,
  } = course.entranceExamData || {};
  const isActiveEntranceExam = entranceExamEnabled && !entranceExamPassed;

  const handleUnitClick = ({
    sequenceId,
    activeUnitId,
    id,
  }) => {
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
  };

  // Load course outline structure when needed
  useEffect(() => {
    if (courseOutlineStatus !== LOADED || courseOutlineShouldUpdate) {
      dispatch(getCourseOutlineStructure(courseId));
    }
  }, [courseId, courseOutlineShouldUpdate]);

  return {
    isEnabledCompletionTracking,
    isActiveEntranceExam,
    courseOutlineStatus,
    activeSequenceId,
    sections,
    sequences,
    units,
    handleUnitClick,
    sequenceStatus,
  };
};

export const useCourseOutlineSidebar = () => {
  const dispatch = useDispatch();
  const courseOutlineShouldUpdate = useSelector(getCourseOutlineShouldUpdate);
  const courseOutlineStatus = useSelector(getCourseOutlineStatus);

  const { courseId } = useParams();
  const course = useModel('coursewareMeta', courseId);

  const {
    unitId,
    currentSidebar,
    toggleSidebar,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);

  // Course outline state is now fully controlled by SidebarContextProvider
  // This component only renders when currentSidebar === 'COURSE_OUTLINE'
  const [isOpen, setIsOpen] = useState(true);

  const {
    entranceExamEnabled,
    entranceExamPassed,
  } = course.entranceExamData || {};
  const isActiveEntranceExam = entranceExamEnabled && !entranceExamPassed;

  const collapseSidebar = () => {
    toggleSidebar(null);
    setOutlineSidebarCollapsed(true);
  };

  const handleToggleCollapse = () => {
    if (currentSidebar === ID) {
      collapseSidebar();
    } else {
      toggleSidebar(ID);
      setOutlineSidebarCollapsed(false);
    }
  };

  // Load course outline structure when needed
  useEffect(() => {
    if (courseOutlineStatus !== LOADED || courseOutlineShouldUpdate) {
      dispatch(getCourseOutlineStructure(courseId));
    }
  }, [courseId, courseOutlineShouldUpdate]);

  // Collapse sidebar if screen resized to a width that displays the sidebar automatically
  useLayoutEffect(() => {
    const handleResize = () => {
      // breakpoints.large.maxWidth is 1200px and currently the breakpoint for showing the sidebar
      if (currentSidebar === ID && global.innerWidth < breakpoints.large.maxWidth) {
        collapseSidebar();
      }
    };

    global.addEventListener('resize', handleResize);
    return () => {
      global.removeEventListener('resize', handleResize);
    };
  }, [currentSidebar]);

  return {
    isActiveEntranceExam,
    unitId,
    currentSidebar,
    shouldDisplayFullScreen,
    isOpen,
    setIsOpen,
    handleToggleCollapse,
  };
};

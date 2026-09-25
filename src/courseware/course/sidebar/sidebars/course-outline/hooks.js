import {
  useLayoutEffect, useRef, useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { breakpoints } from '@openedx/paragon';

import { useModel } from '@src/generic/model-store';
import {
  useCheckBlockCompletion,
  useCourseOutlineStructure,
  useCoursewareOutlineSidebarToggles,
} from '@src/courseware/data/apiHooks';
import { useSidebar } from '../../SidebarContext';
import { ID } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const useCourseOutlineSidebar = () => {
  const checkBlockCompletion = useCheckBlockCompletion();

  const { courseId, sequenceId: activeSequenceId } = useParams();
  const { data: sidebarToggles } = useCoursewareOutlineSidebarToggles(courseId);
  const isEnabledCompletionTracking = sidebarToggles?.enableCompletionTracking;
  const outlineQuery = useCourseOutlineStructure(courseId);
  const { sections = {}, sequences = {}, units = {} } = outlineQuery.data ?? {};
  const course = useModel('coursewareMeta', courseId);

  const {
    unitId,
    currentSidebar,
    toggleSidebar,
    shouldDisplayFullScreen,
  } = useSidebar();

  // Course outline state is now fully controlled by SidebarProvider
  // This component only renders when currentSidebar === 'COURSE_OUTLINE'
  const [isOpen, setIsOpen] = useState(true);

  const {
    entranceExamEnabled,
    entranceExamPassed,
  } = course.entranceExamData || {};
  const isActiveEntranceExam = entranceExamEnabled && !entranceExamPassed;

  const collapseSidebar = () => {
    toggleSidebar(null);
  };

  const handleToggleCollapse = () => {
    if (currentSidebar === ID) {
      collapseSidebar();
    } else {
      toggleSidebar(ID);
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
    checkBlockCompletion(courseId, sequenceId, activeUnitId);

    // Hide the sidebar after selecting a unit on a mobile device.
    if (shouldDisplayFullScreen) {
      handleToggleCollapse();
    }
  };

  // Collapse sidebar if screen resized to a width that displays the sidebar automatically
  const lastWindowWidth = useRef(global.innerWidth);
  useLayoutEffect(() => {
    const handleResize = () => {
      const widthChanged = global.innerWidth !== lastWindowWidth.current;
      lastWindowWidth.current = global.innerWidth;

      // Only react to actual width changes. Mobile browsers fire `resize` on vertical scroll
      // (the URL bar showing/hiding changes only the viewport height), and reacting to those
      // would close the sidebar while the user is simply scrolling its content.
      if (!widthChanged) {
        return;
      }

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
    courseId,
    unitId,
    currentSidebar,
    shouldDisplayFullScreen,
    isEnabledCompletionTracking,
    isOpen,
    setIsOpen,
    handleToggleCollapse,
    isActiveEntranceExam,
    isOutlinePending: outlineQuery.isPending,
    activeSequenceId,
    sections,
    sequences,
    units,
    handleUnitClick,
  };
};

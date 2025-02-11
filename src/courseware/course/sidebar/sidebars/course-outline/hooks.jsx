import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';

import { useModel } from '@src/generic/model-store';
import { LOADED } from '@src/constants';
import { checkBlockCompletion, getCourseOutlineStructure } from '@src/courseware/data/thunks';
import OldSidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import NewSidebarContext from '@src/courseware/course/new-sidebar/SidebarContext';
import {
  getCoursewareOutlineSidebarSettings,
  getCourseOutlineShouldUpdate,
  getCourseOutlineStatus,
  getSequenceId,
  getCourseOutline,
} from '@src/courseware/data/selectors';
import { ID } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const useCourseOutlineSidebar = () => {
  const dispatch = useDispatch();
  const isCollapsedOutlineSidebar = window.sessionStorage.getItem('hideCourseOutlineSidebar');
  const { enableNavigationSidebar: isEnabledSidebar } = useSelector(getCoursewareOutlineSidebarSettings);
  const courseOutlineShouldUpdate = useSelector(getCourseOutlineShouldUpdate);
  const courseOutlineStatus = useSelector(getCourseOutlineStatus);
  const activeSequenceId = useSelector(getSequenceId);
  const { sections = {}, sequences = {}, units = {} } = useSelector(getCourseOutline);

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

  const {
    entranceExamEnabled,
    entranceExamPassed,
  } = course.entranceExamData || {};
  const isActiveEntranceExam = entranceExamEnabled && !entranceExamPassed;

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
    handleUnitClick,
  };
};

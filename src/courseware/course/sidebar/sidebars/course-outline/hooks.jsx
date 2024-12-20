import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useModel } from '@src/generic/model-store';
import OldSidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import NewSidebarContext from '@src/courseware/course/new-sidebar/SidebarContext';
import { getCoursewareOutlineSidebarSettings } from '@src/courseware/data/selectors';
import { ID } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const useCourseOutlineSidebar = () => {
  const isCollapsedOutlineSidebar = window.sessionStorage.getItem('hideCourseOutlineSidebar');
  const { enableNavigationSidebar: isEnabledSidebar } = useSelector(getCoursewareOutlineSidebarSettings);
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

  useEffect(() => {
    if (isOpenSidebar && currentSidebar !== ID) {
      toggleSidebar(ID);
    }
  }, [initialSidebar, unitId]);

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
  };
};

import { useContext } from 'react';

import { useModel } from '@src/generic/model-store';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import { ID } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const useCourseOutlineSidebar = () => {
  const {
    courseId,
    currentSidebar,
    toggleSidebar,
  } = useContext(SidebarContext);

  const course = useModel('coursewareMeta', courseId);
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

  return {
    handleToggleCollapse,
    isActiveEntranceExam,
  };
};

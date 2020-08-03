import React from 'react';
import { useAlert } from '../../../../generic/user-messages';
import { useModel } from '../../../../generic/model-store';

const CourseStartAlert = React.lazy(() => import('./CourseStartAlert'));

function useCourseStartAlert(courseId) {
  const {
    isEnrolled,
  } = useModel('courses', courseId);
  const {
    datesWidget: {
      courseDateBlocks,
      userTimezone,
    },
  } = useModel('outline', courseId);

  const startBlock = courseDateBlocks.find(b => b.dateType === 'course-start-date');
  const delta = startBlock ? new Date(startBlock.date) - new Date() : 0;
  const isVisible = isEnrolled && startBlock && delta > 0;

  useAlert(isVisible, {
    code: 'clientCourseStartAlert',
    payload: {
      delta,
      startDate: startBlock && startBlock.date,
      userTimezone,
    },
    topic: 'outline-course-alerts',
  });

  return {
    clientCourseStartAlert: CourseStartAlert,
  };
}

export default useCourseStartAlert;

/* eslint-disable import/prefer-default-export */
import React from 'react';
import { useAlert } from '../../../../generic/user-messages';
import { useModel } from '../../../../generic/model-store';

const CourseEndAlert = React.lazy(() => import('./CourseEndAlert'));

// period of time (in ms) before end of course during which we alert
const WARNING_PERIOD_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function useCourseEndAlert(courseId) {
  const {
    isEnrolled,
  } = useModel('courses', courseId);
  const {
    datesWidget: {
      courseDateBlocks,
      userTimezone,
    },
  } = useModel('outline', courseId);

  const endBlock = courseDateBlocks.find(b => b.dateType === 'course-end-date');
  const endDate = endBlock ? new Date(endBlock.date) : null;
  const delta = endBlock ? endDate - new Date() : 0;
  const isVisible = isEnrolled && endBlock && delta > 0 && delta < WARNING_PERIOD_MS;

  useAlert(isVisible, {
    code: 'clientCourseEndAlert',
    payload: {
      delta,
      description: endBlock && endBlock.description,
      endDate: endBlock && endBlock.date,
      userTimezone,
    },
    topic: 'outline-course-alerts',
  });

  return {
    clientCourseEndAlert: CourseEndAlert,
  };
}

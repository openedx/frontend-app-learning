import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';
import { useModel } from '../../generic/model-store';

const CourseStartAlert = React.lazy(() => import('./CourseStartAlert'));
const CourseStartMasqueradeBanner = React.lazy(() => import('./CourseStartMasqueradeBanner'));

function isStartDateInFuture(courseId) {
  const {
    start,
  } = useModel('courseHomeMeta', courseId);

  const today = new Date();
  const startDate = new Date(start);
  return startDate > today;
}

function useCourseStartAlert(courseId) {
  const {
    isEnrolled,
  } = useModel('courseHomeMeta', courseId);

  const isVisible = isEnrolled && isStartDateInFuture(courseId);

  const payload = {
    courseId,
  };

  useAlert(isVisible, {
    code: 'clientCourseStartAlert',
    payload: useMemo(() => payload, Object.values(payload).sort()),
    topic: 'outline-course-alerts',
  });

  return {
    clientCourseStartAlert: CourseStartAlert,
  };
}

export function useCourseStartMasqueradeBanner(courseId, tab) {
  const {
    isMasquerading,
  } = useModel('courseHomeMeta', courseId);

  const isVisible = isMasquerading && tab === 'progress' && isStartDateInFuture(courseId);

  const payload = {
    courseId,
  };

  useAlert(isVisible, {
    code: 'clientCourseStartMasqueradeBanner',
    payload: useMemo(() => payload, Object.values(payload).sort()),
    topic: 'instructor-toolbar-alerts',
  });

  return {
    clientCourseStartMasqueradeBanner: CourseStartMasqueradeBanner,
  };
}

export default useCourseStartAlert;

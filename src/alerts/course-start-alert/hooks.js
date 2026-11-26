import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';
import { useCourseHomeMeta } from '../../course-home/data/apiHooks';

const CourseStartAlert = React.lazy(() => import('./CourseStartAlert'));
const CourseStartMasqueradeBanner = React.lazy(() => import('./CourseStartMasqueradeBanner'));

function IsStartDateInFuture(courseId) {
  const start = useCourseHomeMeta(courseId, { enabled: false }).data?.start;

  const today = new Date();
  const startDate = new Date(start);
  return startDate > today;
}

function useCourseStartAlert(courseId) {
  const isEnrolled = useCourseHomeMeta(courseId, { enabled: false }).data?.isEnrolled;

  const isVisible = isEnrolled && IsStartDateInFuture(courseId);

  const payload = useMemo(() => ({
    courseId,
  }), [courseId]);

  useAlert(isVisible, {
    code: 'clientCourseStartAlert',
    payload,
    topic: 'outline-course-alerts',
  });

  return {
    clientCourseStartAlert: CourseStartAlert,
  };
}

// Only the progress tab shows this banner, so only it calls this hook.
export function useCourseStartMasqueradeBanner(courseId) {
  const isMasquerading = useCourseHomeMeta(courseId, { enabled: false }).data?.isMasquerading;
  // Called whatever the metadata says: the tab calls this hook before its metadata has loaded.
  const isStartDateInFuture = IsStartDateInFuture(courseId);

  const isVisible = isMasquerading && isStartDateInFuture;

  const payload = useMemo(() => ({
    courseId,
  }), [courseId]);

  useAlert(isVisible, {
    code: 'clientCourseStartMasqueradeBanner',
    payload,
    topic: 'instructor-toolbar-alerts',
  });

  return {
    clientCourseStartMasqueradeBanner: CourseStartMasqueradeBanner,
  };
}

export default useCourseStartAlert;

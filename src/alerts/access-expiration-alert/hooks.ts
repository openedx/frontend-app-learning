import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';
import { useCourseHomeMeta } from '../../course-home/data/apiHooks';
import type { CourseHomeAccessExpiration } from '../../course-home/data/courseHomeOutline';

const AccessExpirationAlert = React.lazy(() => import('./AccessExpirationAlert'));
const AccessExpirationMasqueradeBanner = React.lazy(() => import('./AccessExpirationMasqueradeBanner'));

function useAccessExpirationAlert(
  accessExpiration: CourseHomeAccessExpiration | null | undefined,
  courseId: string,
  org: string,
  userTimezone: string | undefined,
  topic: string,
  analyticsPageName: string,
) {
  const isVisible = accessExpiration && !accessExpiration.masqueradingExpiredCourse; // If it exists, show it.
  const payload = useMemo(() => ({
    accessExpiration,
    courseId,
    org,
    userTimezone,
    analyticsPageName,
  }), [accessExpiration, analyticsPageName, courseId, org, userTimezone]);

  useAlert(isVisible, {
    code: 'clientAccessExpirationAlert',
    payload,
    topic,
  });

  return { clientAccessExpirationAlert: AccessExpirationAlert };
}

// The caller passes the access expiration from its own tab's payload.
export function useAccessExpirationMasqueradeBanner(
  courseId: string,
  accessExpiration: CourseHomeAccessExpiration | null | undefined,
) {
  const userTimezone = useCourseHomeMeta(courseId, { enabled: false }).data?.userTimezone;

  const isVisible = accessExpiration && accessExpiration.masqueradingExpiredCourse;
  const expirationDate = accessExpiration && accessExpiration.expirationDate;
  const payload = useMemo(() => ({
    expirationDate,
    userTimezone,
  }), [expirationDate, userTimezone]);

  useAlert(isVisible, {
    code: 'clientAccessExpirationMasqueradeBanner',
    payload,
    topic: 'instructor-toolbar-alerts',
  });

  return { clientAccessExpirationMasqueradeBanner: AccessExpirationMasqueradeBanner };
}

export default useAccessExpirationAlert;

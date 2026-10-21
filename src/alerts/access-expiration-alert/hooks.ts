import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAlert } from '../../generic/user-messages';
import { useCourseHomeMeta, useOutlineTabData, useProgressTabData } from '../../course-home/data/apiHooks';
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

export function useAccessExpirationMasqueradeBanner(courseId: string, tab: string) {
  const { targetUserId } = useParams();
  const userTimezone = useCourseHomeMeta(courseId, { enabled: false }).data?.userTimezone;
  const outline = useOutlineTabData(courseId, { enabled: false }).data;
  const progress = useProgressTabData(courseId, targetUserId, { enabled: false }).data;
  const accessExpirationByTab: Partial<Record<string, CourseHomeAccessExpiration | null>> = {
    outline: outline?.accessExpiration,
    progress: progress?.accessExpiration,
  };
  const accessExpiration = accessExpirationByTab[tab];

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

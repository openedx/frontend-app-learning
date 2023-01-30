import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';
import { useModel } from '../../generic/model-store';

const AccessExpirationAlert = React.lazy(() => import('./AccessExpirationAlert'));
const AccessExpirationMasqueradeBanner = React.lazy(() => import('./AccessExpirationMasqueradeBanner'));

function useAccessExpirationAlert(accessExpiration, courseId, org, userTimezone, topic, analyticsPageName) {
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

export function useAccessExpirationMasqueradeBanner(courseId, tab) {
  const {
    userTimezone,
  } = useModel('courseHomeMeta', courseId);
  const {
    accessExpiration,
  } = useModel(tab, courseId);

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

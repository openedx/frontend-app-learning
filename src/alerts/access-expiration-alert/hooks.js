import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';

const AccessExpirationAlert = React.lazy(() => import('./AccessExpirationAlert'));

function useAccessExpirationAlert(accessExpiration, courseId, org, userTimezone, topic, analyticsPageName) {
  const isVisible = !!accessExpiration; // If it exists, show it.
  const payload = {
    accessExpiration,
    courseId,
    org,
    userTimezone,
    analyticsPageName,
  };

  useAlert(isVisible, {
    code: 'clientAccessExpirationAlert',
    payload: useMemo(() => payload, Object.values(payload).sort()),
    topic,
  });

  return { clientAccessExpirationAlert: AccessExpirationAlert };
}

export default useAccessExpirationAlert;

import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';

const AccessExpirationAlert = React.lazy(() => import('./AccessExpirationAlert'));

function useAccessExpirationAlert(accessExpiration, userTimezone, topic) {
  const isVisible = !!accessExpiration; // If it exists, show it.
  const payload = {
    accessExpiration,
    userTimezone,
  };

  useAlert(isVisible, {
    code: 'clientAccessExpirationAlert',
    payload: useMemo(() => payload, Object.values(payload).sort()),
    topic,
  });

  return { clientAccessExpirationAlert: AccessExpirationAlert };
}

export default useAccessExpirationAlert;

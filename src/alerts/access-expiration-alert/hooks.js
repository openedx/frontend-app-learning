import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';

const AccessExpirationAlert = React.lazy(() => import('./AccessExpirationAlert'));

function useAccessExpirationAlert(accessExpiration, userTimezone, topic) {
  const isVisible = !!accessExpiration; // If it exists, show it.

  useAlert(isVisible, {
    code: 'clientAccessExpirationAlert',
    payload: useMemo(() => ({ accessExpiration, userTimezone }), [accessExpiration, userTimezone]),
    topic,
  });

  return { clientAccessExpirationAlert: AccessExpirationAlert };
}

export default useAccessExpirationAlert;

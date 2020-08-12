import React from 'react';
import { useAlert } from '../../generic/user-messages';

const AccessExpirationAlert = React.lazy(() => import('./AccessExpirationAlert'));

function useAccessExpirationAlert(courseExpiredMessage, topic) {
  const rawHtml = courseExpiredMessage || null;
  const isVisible = !!rawHtml; // If it exists, show it.

  useAlert(isVisible, {
    code: 'clientAccessExpirationAlert',
    topic,
    payload: { rawHtml },
  });

  return { clientAccessExpirationAlert: AccessExpirationAlert };
}

export default useAccessExpirationAlert;

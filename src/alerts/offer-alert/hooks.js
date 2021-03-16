import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';

const OfferAlert = React.lazy(() => import('./OfferAlert'));

export function useOfferAlert(courseId, offer, org, userTimezone, topic, analyticsPageName) {
  const isVisible = !!offer; // if it exists, show it.
  const payload = {
    analyticsPageName,
    courseId,
    offer,
    org,
    userTimezone,
  };

  useAlert(isVisible, {
    code: 'clientOfferAlert',
    topic,
    payload: useMemo(() => payload, Object.values(payload).sort()),
  });

  return { clientOfferAlert: OfferAlert };
}

export default useOfferAlert;

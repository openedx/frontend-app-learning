import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';

const OfferAlert = React.lazy(() => import('./OfferAlert'));

export function useOfferAlert(offer, userTimezone, topic) {
  const isVisible = !!offer; // if it exists, show it.
  const payload = {
    offer,
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

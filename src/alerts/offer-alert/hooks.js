import React, { useMemo } from 'react';
import { useAlert } from '../../generic/user-messages';

const OfferAlert = React.lazy(() => import('./OfferAlert'));

export function useOfferAlert(offer, userTimezone, topic) {
  const isVisible = !!offer; // if it exists, show it.

  useAlert(isVisible, {
    code: 'clientOfferAlert',
    topic,
    payload: useMemo(() => ({ offer, userTimezone }), [offer, userTimezone]),
  });

  return { clientOfferAlert: OfferAlert };
}

export default useOfferAlert;

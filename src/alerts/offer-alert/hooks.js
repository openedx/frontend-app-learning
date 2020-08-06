import React from 'react';
import { useAlert } from '../../generic/user-messages';

const OfferAlert = React.lazy(() => import('./OfferAlert'));

export function useOfferAlert(offerHtml, topic) {
  const rawHtml = offerHtml || null;
  const isVisible = !!rawHtml; // if it exists, show it.

  useAlert(isVisible, {
    code: 'clientOfferAlert',
    topic,
    payload: { rawHtml },
  });

  return { clientOfferAlert: OfferAlert };
}

export default useOfferAlert;

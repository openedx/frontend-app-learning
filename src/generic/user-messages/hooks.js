/* eslint-disable import/prefer-default-export */
import { useContext, useEffect } from 'react';
import UserMessagesContext from './UserMessagesContext';

export function useAlert(isVisible, {
  code, text, topic, type, payload, dismissible,
}) {
  const { add, remove } = useContext(UserMessagesContext);

  // Please note:
  // The deps list [isVisible, code, ... etc.] in this `useEffect` call prevents the
  // effect from running if none of deps have changed. However, "changed" for objects is
  // defined in terms of identity; thus, if you provide a payload that is *seemingly* equal
  // to the previous one but *actually* a different object, then this effect will run.
  // If you are particularly unlucky, this will cause an infinite re-render loop.
  // This manifested itself in TNL-7400.
  // We hope to address the underlying issue in TNL-7418.
  // In the mean time, you may follow the pattern that `useAccessExpirationAlert`
  // establishes: memoize the payload so that the exact same object is used if the
  // payload has not changed. And don't put values based off of now() in your payload, as
  // that breaks memoization.
  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const cleanupId = add({
      code, text, topic, type, payload, dismissible,
    });

    return () => {
      remove(cleanupId);
    };
  }, [isVisible, code, text, topic, type, payload, dismissible]);
}

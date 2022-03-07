/* eslint-disable import/prefer-default-export */

import { useEffect, useRef } from 'react';

export function useEventListener(type, handler) {
  // We use this ref so that we can hold a reference to the currently active event listener.
  const eventListenerRef = useRef(null);
  useEffect(() => {
    // If we currently have an event listener, remove it.
    if (eventListenerRef.current !== null) {
      global.removeEventListener(type, eventListenerRef.current);
      eventListenerRef.current = null;
    }
    // Now add our new handler as the event listener.
    global.addEventListener(type, handler);
    // And then save it to our ref for next time.
    eventListenerRef.current = handler;
    // When the component finally unmounts, use the ref to remove the correct handler.
    return () => global.removeEventListener(type, eventListenerRef.current);
  }, [type, handler]);
}

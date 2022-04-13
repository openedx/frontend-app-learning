/* eslint-disable import/prefer-default-export */

import {
  useCallback, useEffect, useRef, useState,
} from 'react';

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

/**
 * Hooks up post messages to callbacks
 * @param {Object.<string, function>} events A mapping of message type to callback
 */
export function useIFramePluginEvents(events) {
  const receiveMessage = useCallback(({ data }) => {
    const {
      type,
      payload,
    } = data;
    if (events[type]) {
      events[type](payload);
    }
  }, [events]);
  useEventListener('message', receiveMessage);
}

/**
 * A hook to monitor message about changes in iframe content height
 * @param onIframeLoaded A callback for when the frame is loaded
 * @returns {[boolean, number]}
 */
export function useIFrameHeight(onIframeLoaded = null) {
  const [iframeHeight, setIframeHeight] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const receiveResizeMessage = useCallback(({ height }) => {
    setIframeHeight(height);
    if (!hasLoaded && !iframeHeight && height > 0) {
      setHasLoaded(true);
      if (onIframeLoaded) {
        onIframeLoaded();
      }
    }
  }, [setIframeHeight, hasLoaded, iframeHeight, setHasLoaded, onIframeLoaded]);
  useIFramePluginEvents({ 'plugin.resize': receiveResizeMessage });
  return [hasLoaded, iframeHeight];
}

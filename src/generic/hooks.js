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

/**
 * Custom hook that adds functionality to skip to a specific content section on the page
 * when a specified skip link is activated by pressing the "Enter" key, "Space" key, or by clicking the link.
 *
 * @param {string} [targetElementId='main-content'] - The ID of the element to skip to when the link is activated.
 * @param {string} [skipLinkSelector='a[href="#main-content"]'] - The CSS selector for the skip link.
 * @param {number} [scrollOffset=100] - The offset to apply when scrolling to the target element (in pixels).
 *
 * @returns {React.RefObject<HTMLElement>} - A ref object pointing to the skip link element.
 */
export function useScrollToContent(
  targetElementId = 'main-content',
  skipLinkSelector = 'a[href="#main-content"]',
  scrollOffset = 100,
) {
  const skipLinkElementRef = useRef(null);

  /**
   * Scrolls the page to the target element and sets focus.
   *
   * @param {HTMLElement} targetElement - The target element to scroll to and focus.
   */
  const scrollToTarget = (targetElement) => {
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: targetPosition - scrollOffset, behavior: 'smooth' });

    if (typeof targetElement.focus === 'function') {
      targetElement.focus({ preventScroll: true });
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Element with ID "${targetElementId}" exists but is not focusable.`);
    }
  };

  /**
   * Determines if the event should trigger the skip to content action.
   *
   * @param {KeyboardEvent|MouseEvent} event - The event triggered by the user.
   * @returns {boolean} - True if the event should trigger the skip to content action, otherwise false.
   */
  const shouldTriggerSkip = (event) => event.key === 'Enter' || event.key === ' ' || event.type === 'click';

  /**
   * Handles the keydown and click events on the skip link.
   *
   * @param {KeyboardEvent|MouseEvent} event - The event triggered by the user.
   */
  const handleSkipAction = useCallback((event) => {
    if (shouldTriggerSkip(event)) {
      event.preventDefault();
      const targetElement = document.getElementById(targetElementId);
      if (targetElement) {
        scrollToTarget(targetElement);
      } else {
        // eslint-disable-next-line no-console
        console.warn(`Element with ID "${targetElementId}" not found.`);
      }
    }
  }, [targetElementId, scrollOffset]);

  useEffect(() => {
    const skipLinkElement = document.querySelector(skipLinkSelector);
    skipLinkElementRef.current = skipLinkElement;

    if (skipLinkElement) {
      skipLinkElement.addEventListener('keydown', handleSkipAction);
      skipLinkElement.addEventListener('click', handleSkipAction);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Skip link with selector "${skipLinkSelector}" not found.`);
    }

    return () => {
      if (skipLinkElement) {
        skipLinkElement.removeEventListener('keydown', handleSkipAction);
        skipLinkElement.removeEventListener('click', handleSkipAction);
      }
    };
  }, [skipLinkSelector, handleSkipAction]);

  return skipLinkElementRef;
}

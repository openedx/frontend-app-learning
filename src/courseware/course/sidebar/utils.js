/**
 * Attempts to find an interactive element by its selector and focus it.
 * If the element is found and is not disabled, it prevents the default
 * behavior of the event (e.g., standard Tab) and moves focus to the element.
 *
 * @param {Event} event - The keyboard event object (e.g., from a 'keydown' listener).
 * @param {string} selector - The CSS selector for the target element to focus.
 * @returns {boolean} - Returns `true` if the element was found, enabled, and focused.
 * Returns `false` if the element was not found or was disabled.
 */
export const tryFocusAndPreventDefault = (event, selector) => {
  const element = document.querySelector(selector);
  if (element && !element.disabled) {
    event.preventDefault();
    element.focus();
    return true;
  }
  return false;
};

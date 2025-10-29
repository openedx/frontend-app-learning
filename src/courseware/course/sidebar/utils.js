export const tryFocusAndPreventDefault = (event, selector) => {
  const element = document.querySelector(selector);
  if (element && !element.disabled) {
    event.preventDefault();
    element.focus();
    return true;
  }
  return false;
};

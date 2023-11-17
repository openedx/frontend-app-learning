// This file holds some convenience methods for dealing with sessionStorage. Unlike localStorage that never expires,
// sessionStorage is cleared when the browser tab is closed since the page session ends
//
// NOTE: These storage keys are not namespaced.  That means that it's shared for the current fully
// qualified domain.  Namespacing could be added, but we'll cross that bridge when we need it.

function getSessionStorage(key) {
  try {
    if (global.sessionStorage) {
      const rawItem = global.sessionStorage.getItem(key);
      if (rawItem) {
        return JSON.parse(rawItem);
      }
    }
  } catch (e) {
    // If this fails for some reason, just return null.
  }
  return null;
}

function setSessionStorage(key, value) {
  try {
    if (global.sessionStorage) {
      global.sessionStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    // If this fails, just bail.
  }
}

export {
  getSessionStorage,
  setSessionStorage,
};

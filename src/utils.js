// Helper, that is used to forcibly finalize all promises
// in thunk before running matcher against state.
export const executeThunk = async (thunk, dispatch, getState) => {
  await thunk(dispatch, getState);
  await new Promise(setImmediate);
};

// Utility function for appending the browser timezone to the url
// Can be used on the backend when the user timezone is not set in the user account
export const appendBrowserTimezoneToUrl = (url) => {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const urlObject = new URL(url);
  if (browserTimezone) {
    urlObject.searchParams.append('browser_timezone', browserTimezone);
  }
  return urlObject.href;
};

/**
 * Utility function for appending the browser timezone to the url
 * Can be used on the backend when the user timezone is not set in the user account
 */
export const appendBrowserTimezoneToUrl = (url: string) => {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const urlObject = new URL(url);
  if (browserTimezone) {
    urlObject.searchParams.append('browser_timezone', browserTimezone);
  }
  return urlObject.href;
};

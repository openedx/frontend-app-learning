import {
  getAuthenticatedHttpClient,
  getAuthenticatedUser,
  getSiteConfig,
  logError,
  logInfo,
} from '@openedx/frontend-base';

export const getNotices = async () => {
  const authenticatedUser = getAuthenticatedUser();
  const url = new URL(`${getSiteConfig().lmsBaseUrl}/notices/api/v1/unacknowledged`);
  if (authenticatedUser) {
    try {
      const { data } = await getAuthenticatedHttpClient().get(url.href, {});
      return data;
    } catch (e) {
      // we will just swallow error, as that probably means the notices app is not installed.
      // Notices are not necessary for the rest of courseware to function.
      const { customAttributes: { httpErrorStatus } } = e;
      if (httpErrorStatus === 404) {
        logInfo(`${e}. This probably happened because the notices plugin is not installed on platform.`);
      } else {
        logError(e);
      }
    }
  }
  return null;
};

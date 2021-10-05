/* eslint-disable import/prefer-default-export */
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

export const getNotices = async () => {
  const authenticatedUser = getAuthenticatedUser();
  const url = new URL(`${getConfig().LMS_BASE_URL}/notices/api/v1/unacknowledged`);
  if (authenticatedUser) {
    try {
      const { data } = await getAuthenticatedHttpClient().get(url.href, {});
      return data;
    } catch (e) {
      // we will just swallow error, as that probably means the notices app is not installed.
      // Notices are not necessary for the rest of courseware to function.
    }
  }
  return null;
};

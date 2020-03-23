import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

const bookmarksBaseUrl = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`;

export async function createBookmark(usageId) {
  return getAuthenticatedHttpClient().post(bookmarksBaseUrl, { usage_id: usageId });
}

export async function deleteBookmark(usageId) {
  const { username } = getAuthenticatedUser();
  return getAuthenticatedHttpClient().delete(`${bookmarksBaseUrl}${username},${usageId}/`);
}

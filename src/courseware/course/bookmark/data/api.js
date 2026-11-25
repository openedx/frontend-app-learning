import { getAuthenticatedHttpClient, getAuthenticatedUser, getSiteConfig } from '@openedx/frontend-base';

export const getBookmarksBaseUrl = () => `${getSiteConfig().lmsBaseUrl}/api/bookmarks/v1/bookmarks/`;

export async function createBookmark(usageId) {
  return getAuthenticatedHttpClient().post(getBookmarksBaseUrl(), { usage_id: usageId });
}

export async function deleteBookmark(usageId) {
  const { username } = getAuthenticatedUser();
  return getAuthenticatedHttpClient().delete(`${getBookmarksBaseUrl()}${username},${usageId}/`);
}

import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';

// Does not block on answer
export function postCelebrationComplete(courseId, data) {
  const url = new URL(`${getSiteConfig().lmsBaseUrl}/api/courseware/celebration/${courseId}`);
  getAuthenticatedHttpClient().post(url.href, data);
}

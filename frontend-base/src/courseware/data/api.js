import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { appendBrowserTimezoneToUrl } from '../../utils';
import { normalizeCoursewareMeta } from './coursewareMeta';

export async function getCourseMetadata(courseId) {
  let url = `${getSiteConfig().lmsBaseUrl}/api/courseware/course/${courseId}`;
  url = appendBrowserTimezoneToUrl(url);
  const metadata = await getAuthenticatedHttpClient().get(url);
  return normalizeCoursewareMeta(metadata);
}

import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { appendBrowserTimezoneToUrl } from '../../utils';
import { normalizeCoursewareMeta } from './coursewareMeta';

export async function getCourseMetadata(courseId) {
  let url = `${getSiteConfig().lmsBaseUrl}/api/courseware/course/${courseId}`;
  url = appendBrowserTimezoneToUrl(url);
  const metadata = await getAuthenticatedHttpClient().get(url);
  return normalizeCoursewareMeta(metadata);
}

export async function sendActivationEmail() {
  const url = new URL(`${getSiteConfig().lmsBaseUrl}/api/send_account_activation_email`);
  const { data } = await getAuthenticatedHttpClient().post(url.href, {});
  return data;
}

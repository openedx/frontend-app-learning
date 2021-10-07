import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export async function getMasqueradeOptions(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return camelCaseObject(data);
}

export async function postMasqueradeOptions(courseId, payload) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`);
  const { data } = await getAuthenticatedHttpClient().post(url.href, payload);
  return camelCaseObject(data);
}

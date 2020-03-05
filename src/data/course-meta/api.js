/* eslint-disable import/prefer-default-export */
import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export async function getCourseMetadata(courseUsageKey) {
  const url = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseUsageKey}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  const processedData = camelCaseObject(data);
  return processedData;
}

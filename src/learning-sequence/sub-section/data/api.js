import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/* eslint-disable import/prefer-default-export */

export async function getSubSectionMetadata(courseId, subSectionId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${subSectionId}/handler/xmodule_handler/metadata`, {});

  return data;
}

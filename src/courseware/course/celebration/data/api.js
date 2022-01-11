/* eslint-disable import/prefer-default-export */

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// Does not block on answer
export function postCelebrationComplete(courseId, data) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courseware/celebration/${courseId}`);
  getAuthenticatedHttpClient().post(url.href, data);
}

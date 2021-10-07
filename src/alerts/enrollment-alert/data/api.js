/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export async function postCourseEnrollment(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  const { data } = await getAuthenticatedHttpClient().post(url, { course_details: { course_id: courseId } });
  return data;
}

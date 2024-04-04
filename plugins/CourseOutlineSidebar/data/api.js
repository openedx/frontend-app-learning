import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { normalizeOutlineBlocks } from './utils';

/**
 * Get course outline structure for the courseware sidebar.
 * @param {string} courseId - The unique identifier for the course.
 * @returns {Promise<{units: {}, sequences: {}, sections: {}}|null>}
 */
// eslint-disable-next-line import/prefer-default-export
export async function getCourseOutline(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/course_home/v1/sidebar/${courseId}`);

  return data.blocks ? normalizeOutlineBlocks(courseId, data.blocks) : null;
}

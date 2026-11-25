import {
  camelCaseObject, getAuthenticatedHttpClient, getAuthenticatedUser, getSiteConfig,
} from '@openedx/frontend-base';
import { appendBrowserTimezoneToUrl } from '../../utils';
import { normalizeCourseNavigationOutline } from './courseNavigationOutline';
import { normalizeCoursewareMeta } from './coursewareMeta';
import { normalizeMinimalCourseOutline } from './minimalCourseOutline';
import { normalizeSequenceMetadata } from './sequenceMetadata';

// Do not add further calls to this API - we don't like making use of the modulestore if we can help it
export const getSequenceForUnitDeprecatedUrl = (courseId) => {
  const authenticatedUser = getAuthenticatedUser();
  const url = new URL(`${getSiteConfig().lmsBaseUrl}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', courseId);
  url.searchParams.append('username', authenticatedUser ? authenticatedUser.username : '');
  url.searchParams.append('depth', 3);
  url.searchParams.append('requested_fields', 'children,discussions_url');

  return url;
};
export async function getSequenceForUnitDeprecated(courseId, unitId) {
  const url = getSequenceForUnitDeprecatedUrl(courseId);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  const parent = Object.values(data.blocks).find(block => block.type === 'sequential' && block.children.includes(unitId));
  return parent?.id ?? null;
}

export async function getLearningSequencesOutline(courseId) {
  const outlineUrl = new URL(`${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/${courseId}`);
  const { data } = await getAuthenticatedHttpClient().get(outlineUrl.href, {});
  return normalizeMinimalCourseOutline(data);
}

export async function getCourseMetadata(courseId) {
  let url = `${getSiteConfig().lmsBaseUrl}/api/courseware/course/${courseId}`;
  url = appendBrowserTimezoneToUrl(url);
  const metadata = await getAuthenticatedHttpClient().get(url);
  return normalizeCoursewareMeta(metadata);
}

export async function getSequenceMetadata(sequenceId, params) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${sequenceId}`, { params });

  return normalizeSequenceMetadata(data);
}

const getSequenceHandlerUrl = (courseId, sequenceId) => `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/xblock/${sequenceId}/handler`;

export async function getBlockCompletion(courseId, sequenceId, usageKey) {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceHandlerUrl(courseId, sequenceId)}/get_completion`,
    { usage_key: usageKey },
  );
  return data.complete === true;
}

export async function postSequencePosition(courseId, sequenceId, activeUnitIndex) {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceHandlerUrl(courseId, sequenceId)}/goto_position`,
    // Position is 1-indexed on the server and 0-indexed in this app. Adjust here.
    { position: activeUnitIndex + 1 },
  );
  return data;
}

export async function getResumeBlock(courseId) {
  const url = new URL(`${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return camelCaseObject(data);
}

export async function postIntegritySignature(courseId) {
  const { data } = await getAuthenticatedHttpClient().post(`${getSiteConfig().lmsBaseUrl}/api/agreements/v1/integrity_signature/${courseId}`, {});
  return camelCaseObject(data);
}

export async function sendActivationEmail() {
  const url = new URL(`${getSiteConfig().lmsBaseUrl}/api/send_account_activation_email`);
  const { data } = await getAuthenticatedHttpClient().post(url.href, {});
  return data;
}

export async function getCourseDiscussionConfig(courseId) {
  const url = `${getSiteConfig().lmsBaseUrl}/api/discussion/v1/courses/${courseId}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return data;
}

export async function getCourseTopics(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getSiteConfig().lmsBaseUrl}/api/discussion/v2/course_topics/${courseId}`);
  return camelCaseObject(data);
}

/**
 * Get course outline structure for the courseware navigation sidebar.
 * @param {string} courseId - The unique identifier for the course.
 * @returns {Promise<{units: {}, sequences: {}, sections: {}}|null>}
 */
export async function getCourseOutline(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getSiteConfig().lmsBaseUrl}/api/course_home/v1/navigation/${courseId}`);

  return data.blocks ? normalizeCourseNavigationOutline(data.blocks) : null;
}

/**
 * Get waffle flag value that enables completion tracking.
 * @param {string} courseId - The unique identifier for the course.
 * @returns {Promise<{enable_completion_tracking: boolean}>} - The object
 * of boolean values of enabling of the completion tracking.
 */
export async function getCoursewareOutlineSidebarToggles(courseId) {
  const url = new URL(`${getSiteConfig().lmsBaseUrl}/courses/${courseId}/courseware-navigation-sidebar/toggles/`);
  const { data } = await getAuthenticatedHttpClient().get(url.href);
  return {
    enable_completion_tracking: data.enable_completion_tracking || false,
  };
}

// What the session masquerades as in this course, as one string to compare; null for a user who cannot masquerade.
export async function getMasquerade(courseId) {
  const { data } = await getAuthenticatedHttpClient().get(`${getSiteConfig().lmsBaseUrl}/courses/${courseId}/masquerade`);
  if (!data?.success) {
    return null;
  }
  const {
    role, user_name: userName, group_id: groupId, user_partition_id: userPartitionId,
  } = data.active;
  return JSON.stringify([role, userName, groupId, userPartitionId]);
}

import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { appendBrowserTimezoneToUrl } from '@src/utils';
import {
  normalizeLearningSequencesData, normalizeMetadata, normalizeSequenceMetadata,
} from './utils';

// Do not add further calls to this API - we don't like making use of the modulestore if we can help it
export async function getSequenceForUnitDeprecated(courseId, unitId) {
  const authenticatedUser = getAuthenticatedUser();
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', courseId);
  url.searchParams.append('username', authenticatedUser ? authenticatedUser.username : '');
  url.searchParams.append('depth', 3);
  url.searchParams.append('requested_fields', 'children,discussions_url');

  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  const parent = Object.values(data.blocks).find(block => block.type === 'sequential' && block.children.includes(unitId));
  return parent?.id;
}

export async function getLearningSequencesOutline(courseId) {
  const outlineUrl = new URL(`${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/${courseId}`);
  const { data } = await getAuthenticatedHttpClient().get(outlineUrl.href, {});
  return normalizeLearningSequencesData(data);
}

export async function getCourseMetadata(courseId) {
  let url = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`;
  url = appendBrowserTimezoneToUrl(url);
  const metadata = await getAuthenticatedHttpClient().get(url);
  return normalizeMetadata(metadata);
}

export async function getSequenceMetadata(sequenceId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceId}`, {});

  return normalizeSequenceMetadata(data);
}

const getSequenceHandlerUrl = (courseId, sequenceId) => `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler`;

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
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return camelCaseObject(data);
}

export async function postIntegritySignature(courseId) {
  const { data } = await getAuthenticatedHttpClient().post(`${getConfig().LMS_BASE_URL}/api/agreements/v1/integrity_signature/${courseId}`, {});
  return camelCaseObject(data);
}

export async function sendActivationEmail() {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/send_account_activation_email`);
  const { data } = await getAuthenticatedHttpClient().post(url.href, {});
  return data;
}

export async function getCourseDiscussionConfig(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return data;
}

export async function getCourseTopics(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`);
  return camelCaseObject(data);
}

/**
 * Get waffle flag value that enable courseware outline sidebar.
 * @param {string} courseId - The unique identifier for the course.
 * @returns {Promise<{enabled: boolean}>} - The boolean value of enabling of the outline sidebar.
 */
export async function getCoursewareOutlineSidebarEnabledFlag(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware-sidebar/enabled/`);
  const { data } = await getAuthenticatedHttpClient().get(url.href);
  return { enabled: data.enabled || false };
}

/**
 * Get the waffle flag value that default opens the courseware discussion sidebar.
 * @param {string} courseId - The unique identifier for the course.
 * @returns {Promise<{enabled: boolean}>} - The boolean value of default opening of the discussion sidebar.
 */
export async function getDiscussionSidebarDefaultOpeningFlag(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/discussion-sidebar/enabled/`);
  const { data } = await getAuthenticatedHttpClient().get(url.href);
  return { enabled: data.enabled || false };
}

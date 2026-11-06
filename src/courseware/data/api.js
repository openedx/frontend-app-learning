import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { appendBrowserTimezoneToUrl } from '../../utils';
import {
  normalizeLearningSequencesData, normalizeMetadata, normalizeOutlineBlocks, normalizeSequenceMetadata,
} from './utils';

// Do not add further calls to this API - we don't like making use of the modulestore if we can help it
export const getSequenceForUnitDeprecatedUrl = (courseId) => {
  const authenticatedUser = getAuthenticatedUser();
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', courseId);
  url.searchParams.append('username', authenticatedUser ? authenticatedUser.username : '');
  url.searchParams.append('depth', 'all');
  url.searchParams.append('requested_fields', 'children,discussions_url');

  return url;
};
export async function getSequenceForBlockDeprecated(courseId, blockId) {
  const url = getSequenceForUnitDeprecatedUrl(courseId);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  const blocks = new Map(Object.values(data.blocks || {}).map(block => [block.id, block]));
  const parents = new Map();
  const ambiguous = new Set();
  blocks.forEach(block => {
    (block.children || []).forEach(childId => {
      if (parents.has(childId) && parents.get(childId) !== block.id) {
        ambiguous.add(childId);
      }
      parents.set(childId, block.id);
    });
  });
  const visited = new Set();
  let currentId = blockId;
  let unitId = null;
  while (currentId && !visited.has(currentId) && !ambiguous.has(currentId)) {
    visited.add(currentId);
    const block = blocks.get(currentId);
    if (block?.type === 'vertical') {
      unitId = currentId;
    }
    const parent = blocks.get(parents.get(currentId));
    if (parent?.type === 'sequential') {
      // Older blocks responses can omit the unit itself, but include its parent.
      if (unitId || !block) {
        return { sequenceId: parent.id, unitId: unitId || currentId };
      }
      return null;
    }
    currentId = parent?.id;
  }
  return null;
}

export async function getSequenceForUnitDeprecated(courseId, unitId) {
  const resolved = await getSequenceForBlockDeprecated(courseId, unitId);
  return resolved?.sequenceId;
}

export async function getLearningSequencesOutline(courseId) {
  const outlineUrl = new URL(`${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/${courseId}`);
  const { data } = await getAuthenticatedHttpClient().get(outlineUrl.href, {});
  return normalizeLearningSequencesData(data);
}

export async function getCourseMetadata(courseId) {
  let url = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`;
  url = appendBrowserTimezoneToUrl(url);
  let metadata;
  const retryDelays = [500, 1500];
  for (let attempt = 0; ; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      metadata = await getAuthenticatedHttpClient().get(url);
      break;
    } catch (error) {
      const status = error?.response?.status;
      if ((status && status < 500) || attempt >= retryDelays.length) {
        throw error;
      }
      // Only transient transport/server failures qualify. Never retry access denials.
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => { setTimeout(resolve, retryDelays[attempt]); });
    }
  }
  return normalizeMetadata(metadata);
}

export async function getSequenceMetadata(sequenceId, params) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceId}`, { params });

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
 * Get course outline structure for the courseware navigation sidebar.
 * @param {string} courseId - The unique identifier for the course.
 * @returns {Promise<{units: {}, sequences: {}, sections: {}}|null>}
 */
export async function getCourseOutline(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/course_home/v1/navigation/${courseId}`);

  return data.blocks ? normalizeOutlineBlocks(courseId, data.blocks) : null;
}

/**
 * Get waffle flag value that enables completion tracking.
 * @param {string} courseId - The unique identifier for the course.
 * @returns {Promise<{enable_completion_tracking: boolean}>} - The object
 * of boolean values of enabling of the completion tracking.
 */
export async function getCoursewareOutlineSidebarToggles(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware-navigation-sidebar/toggles/`);
  const { data } = await getAuthenticatedHttpClient().get(url.href);
  return {
    enable_completion_tracking: data.enable_completion_tracking || false,
  };
}

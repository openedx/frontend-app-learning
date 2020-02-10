import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

export async function getCourseBlocks(courseUsageKey) {
  const { username } = getAuthenticatedUser();
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', courseUsageKey);
  url.searchParams.append('username', username);
  url.searchParams.append('depth', 3);
  url.searchParams.append('requested_fields', 'children,show_gated_sections');

  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  // Camelcase block objects (leave blockId keys alone)
  const blocks = Object.entries(data.blocks).reduce((acc, [key, value]) => {
    acc[key] = camelCaseObject(value);
    return acc;
  }, {});

  // Next go through the blocksList again - now that we've added them all to the blocks map - and
  // append a parent ID to every child found in every `children` list, using the blocks map to find
  // them.
  Object.values(blocks).forEach((block) => {
    if (Array.isArray(block.children)) {
      const parentId = block.id;
      block.children.forEach((childBlockId) => {
        blocks[childBlockId].parentId = parentId;
      });
    }
  });

  const processedData = camelCaseObject(data);
  processedData.blocks = blocks;

  return processedData;
}

export async function getSequenceMetadata(sequenceId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceId}`, {});
  const camelCasedData = camelCaseObject(data);

  camelCasedData.items = camelCasedData.items.map((item) => {
    const processedItem = camelCaseObject(item);
    processedItem.contentType = processedItem.type;
    delete processedItem.type;
    return processedItem;
  });

  return camelCasedData;
}

const getSequenceXModuleHandlerUrl = (courseUsageKey, sequenceId) => `${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/xblock/${sequenceId}/handler/xmodule_handler`;

export async function saveSequencePosition(courseUsageKey, sequenceId, position) {
  // Post data sent to this endpoint must be url encoded
  // TODO: Remove the need for this to be the case.
  // TODO: Ensure this usage of URLSearchParams is working in Internet Explorer
  const urlEncoded = new URLSearchParams();
  urlEncoded.append('position', position + 1);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceXModuleHandlerUrl(courseUsageKey, sequenceId)}/goto_position`,
    urlEncoded.toString(),
    requestConfig,
  );

  return data;
}

export async function getBlockCompletion(courseUsageKey, sequenceId, usageKey) {
  // Post data sent to this endpoint must be url encoded
  // TODO: Remove the need for this to be the case.
  // TODO: Ensure this usage of URLSearchParams is working in Internet Explorer
  const urlEncoded = new URLSearchParams();
  urlEncoded.append('usage_key', usageKey);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceXModuleHandlerUrl(courseUsageKey, sequenceId)}/get_completion`,
    urlEncoded.toString(),
    requestConfig,
  );

  if (data.complete) {
    return true;
  }

  return false;
}

const bookmarksBaseUrl = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`;

export async function createBookmark(usageId) {
  return getAuthenticatedHttpClient().post(bookmarksBaseUrl, { usage_id: usageId });
}

export async function deleteBookmark(usageId) {
  const { username } = getAuthenticatedUser();
  return getAuthenticatedHttpClient().delete(`${bookmarksBaseUrl}${username},${usageId}/`);
}

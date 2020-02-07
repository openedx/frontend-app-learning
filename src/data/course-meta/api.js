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

export async function getCourseMetadata(courseUsageKey) {
  const url = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseUsageKey}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  const processedData = camelCaseObject(data);
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

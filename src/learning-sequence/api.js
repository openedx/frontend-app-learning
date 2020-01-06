/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, camelCaseObject } from '@edx/frontend-platform';

export async function loadCourseSequence(courseId, subSectionId, username) {
  const blocksData = await getCourseBlocks(courseId, username);
  const courseBlockId = blocksData.root;
  const blocks = createBlocksMap(blocksData.blocks);
  const defaultedSubSectionId = subSectionId || findFirstLeafChild(blocks, courseBlockId).id;
  const subSectionIds = createSubSectionIdList(blocks, courseBlockId);
  const { subSectionMetadata, units, unitId } = await loadSubSectionMetadata(
    courseId,
    defaultedSubSectionId,
  );

  return {
    blocks,
    subSectionIds,
    courseBlockId,
    subSectionMetadata,
    units,
    unitId,
  };
}

async function getCourseBlocks(courseId, username) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', decodeURIComponent(courseId));
  url.searchParams.append('username', username);
  url.searchParams.append('depth', 2);
  url.searchParams.append('requested_fields', 'children');

  const { data } = await getAuthenticatedHttpClient()
    .get(url.href, {});

  return data;
}

export async function loadSubSectionMetadata(courseId, subSectionId) {
  let subSectionMetadata = await getSubSectionMetadata(courseId, subSectionId);
  subSectionMetadata = camelCaseObject(subSectionMetadata);
  subSectionMetadata.unitIds = subSectionMetadata.items.map(item => item.id);
  const unitId = subSectionMetadata.position ?
    subSectionMetadata.items[subSectionMetadata.position - 1].id :
    subSectionMetadata.items[0].id;
  const units = createUnitsMap(subSectionMetadata.items);

  return {
    subSectionMetadata,
    units,
    unitId,
  };
}

async function getSubSectionMetadata(courseId, subSectionId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${subSectionId}/handler/xmodule_handler/metadata`, {});

  return data;
}

function createBlocksMap(blocksData) {
  const blocks = {};
  const blocksList = Object.values(blocksData);

  // First go through the list and flesh out our blocks map, camelCasing the objects as we go.
  for (let i = 0; i < blocksList.length; i++) {
    const block = blocksList[i];
    blocks[block.id] = camelCaseObject(block);
  }

  // Next go through the blocksList again - now that we've added them all to the blocks map - and
  // append a parent ID to every child found in every `children` list, using the blocks map to find
  // them.
  for (let i = 0; i < blocksList.length; i++) {
    const block = blocksList[i];

    if (Array.isArray(block.children)) {
      for (let j = 0; j < block.children.length; j++) {
        const childId = block.children[j];
        const child = blocks[childId];
        child.parentId = block.id;
      }
    }
  }

  return blocks;
}

function createUnitsMap(unitsList) {
  const units = {};
  for (let i = 0; i < unitsList.length; i++) {
    const unit = unitsList[i];
    units[unit.id] = camelCaseObject(unit);
  }
  return units;
}

function findFirstLeafChild(blocks, entryPointId) {
  const block = blocks[entryPointId];
  if (Array.isArray(block.children) && block.children.length > 0) {
    return findFirstLeafChild(blocks, block.children[0]);
  }
  return block;
}

function createSubSectionIdList(blocks, entryPointId, subSections = []) {
  const block = blocks[entryPointId];
  if (block.type === 'sequential') {
    subSections.push(block.id);
  }
  if (Array.isArray(block.children)) {
    for (let i = 0; i < block.children.length; i++) {
      const childId = block.children[i];
      createSubSectionIdList(blocks, childId, subSections);
    }
  }
  return subSections;
}

export function findBlockAncestry(blocks, block, descendents = []) {
  descendents.unshift(block);
  if (block.parentId === undefined) {
    return descendents;
  }
  return findBlockAncestry(blocks, blocks[block.parentId], descendents);
}

/* eslint-disable no-plusplus */
import { camelCaseObject } from '@edx/frontend-platform';

export function createBlocksMap(blocksData) {
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

export function createSubSectionIdList(blocks, entryPointId, subSections = []) {
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

export function createUnitIdList(blocks, entryPointId, units = []) {
  const block = blocks[entryPointId];
  if (block.type === 'vertical') {
    units.push(block.id);
  }
  if (Array.isArray(block.children)) {
    for (let i = 0; i < block.children.length; i++) {
      const childId = block.children[i];
      createUnitIdList(blocks, childId, units);
    }
  }
  return units;
}

export function findBlockAncestry(blocks, blockId, descendents = []) {
  const block = blocks[blockId];
  descendents.unshift(block);
  if (block.parentId === undefined) {
    return descendents;
  }
  return findBlockAncestry(blocks, block.parentId, descendents);
}

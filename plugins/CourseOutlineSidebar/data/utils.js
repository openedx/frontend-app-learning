import { logInfo } from '@edx/frontend-platform/logging';

/**
 * Normalizes outline blocks for a given course.
 * @param {string} courseId - The unique identifier for the course.
 * @param {Object} blocks - An object containing different blocks of the course outline.
 * @returns {Object} - An object with normalized sections, sequences, and units.
 */
// eslint-disable-next-line import/prefer-default-export
export function normalizeOutlineBlocks(courseId, blocks) {
  const models = {
    sections: {},
    sequences: {},
    units: {},
  };
  Object.values(blocks).forEach(block => {
    switch (block.type) {
      case 'chapter':
        models.sections[block.id] = {
          complete: block.complete,
          id: block.id,
          title: block.display_name,
          sequenceIds: block.children || [],
        };
        break;

      case 'sequential':
      case 'lock':
        models.sequences[block.id] = {
          complete: block.complete,
          id: block.id,
          title: block.display_name,
          type: block.type,
          specialExamInfo: block.special_exam_info,
          unitIds: block.children || [],
        };
        break;

      case 'vertical':
        models.units[block.id] = {
          complete: block.complete,
          icon: block.icon,
          id: block.id,
          title: block.display_name,
          type: block.type,
        };
        break;

      default:
        logInfo(`Unexpected course block type: ${block.type} with ID ${block.id}.  Expected block types are course, chapter, and sequential.`);
    }
  });

  return models;
}

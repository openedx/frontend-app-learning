import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import './block.factory';

Factory.define('courseBlocks')
  .option('courseId', 'course-v1:edX+DemoX+Demo_Course')
  .option('units')
  .option('sequence')
  .option('section')
  .option('course')
  .attr(
    'blocks',
    ['course', 'section', 'sequence', 'units'],
    (course, section, sequence, units) => {
      const unitsObj = {};
      units.forEach(unit => {
        unitsObj[unit.id] = unit;
      });
      return {
        [course.id]: course,
        [section.id]: section,
        [sequence.id]: sequence,
        ...unitsObj,
      };
    },
  )
  .attr('root', ['course'], course => course.id);

/**
 * Builds a course with a single chapter, sequence, and unit.
 */
export default function buildSimpleCourseBlocks(courseId, title, numUnits = 1) {
  const unitBlocks = [];
  for (let i = 0; i < numUnits; i++) {
    const unitBlock = Factory.build(
      'block',
      { type: 'vertical' },
      { courseId },
    );
    unitBlocks.push(unitBlock);
  }
  const sequenceBlock = Factory.build(
    'block',
    { type: 'sequential', children: unitBlocks.map(unitBlock => unitBlock.id) },
    { courseId },
  );
  const sectionBlock = Factory.build(
    'block',
    { type: 'chapter', children: [sequenceBlock.id] },
    { courseId },
  );
  const courseBlock = Factory.build(
    'block',
    { type: 'course', display_name: title, children: [sectionBlock.id] },
    { courseId },
  );
  return {
    courseBlocks: Factory.build(
      'courseBlocks',
      { courseId },
      {
        units: unitBlocks,
        sequence: sequenceBlock,
        section: sectionBlock,
        course: courseBlock,
      },
    ),
    unitBlocks,
    sequenceBlock,
    sectionBlock,
    courseBlock,
  };
}

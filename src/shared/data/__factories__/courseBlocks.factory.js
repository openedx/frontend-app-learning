import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import './block.factory';

// Generates an Array of block IDs, either from a single block or an array of blocks.
const getIds = (attr) => {
  const blocks = Array.isArray(attr) ? attr : [attr];
  return blocks.map(block => block.id);
};

// Generates an Object in { [block.id]: block } format, either from a single block or an array of blocks.
const getBlocks = (attr) => {
  const blocks = Array.isArray(attr) ? attr : [attr];
  // eslint-disable-next-line no-return-assign,no-sequences
  return blocks.reduce((acc, block) => (acc[block.id] = block, acc), {});
};

Factory.define('courseBlocks')
  .option('courseId', 'course-v1:edX+DemoX+Demo_Course')
  .option('units', ['courseId'], courseId => [
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId },
    ),
  ])
  .option('sequences', ['courseId', 'units'], (courseId, units) => [
    Factory.build(
      'block',
      { type: 'sequential', children: getIds(units) },
      { courseId },
    ),
  ])
  .option('sections', ['courseId', 'sequences'], (courseId, sequences) => [
    Factory.build(
      'block',
      { type: 'chapter', children: getIds(sequences) },
      { courseId },
    ),
  ])
  .option('course', ['courseId', 'sections'], (courseId, sections) => Factory.build(
    'block',
    { type: 'course', children: getIds(sections) },
    { courseId },
  ))
  .attr(
    'blocks',
    ['course', 'sections', 'sequences', 'units'],
    (course, sections, sequences, units) => ({
      [course.id]: course,
      ...getBlocks(sections),
      ...getBlocks(sequences),
      ...getBlocks(units),
    }),
  )
  .attr('root', ['course'], course => course.id);

/**
 * Builds a course with a single chapter, sequence, and unit.
 */
export function buildSimpleCourseBlocks(courseId, title, options = {}) {
  const unitBlocks = options.unitBlocks || [Factory.build(
    'block',
    { type: 'vertical' },
    { courseId },
  )];
  const sequenceBlocks = options.sequenceBlocks || [Factory.build(
    'block',
    { type: 'sequential', children: unitBlocks.map(block => block.id) },
    { courseId },
  )];
  const sectionBlocks = options.sectionBlocks || [Factory.build(
    'block',
    { type: 'chapter', children: sequenceBlocks.map(block => block.id) },
    { courseId },
  )];
  const courseBlock = options.courseBlock || Factory.build(
    'block',
    { type: 'course', display_name: title, children: sectionBlocks.map(block => block.id) },
    { courseId },
  );
  return {
    courseBlocks: options.courseBlocks || Factory.build(
      'courseBlocks',
      {
        courseId,
        hasScheduledContent: options.hasScheduledContent || false,
        title: 'Demo Course',
      },
      {
        units: unitBlocks,
        sequences: sequenceBlocks,
        sections: sectionBlocks,
        course: courseBlock,
      },
    ),
    unitBlocks,
    sequenceBlocks,
    sectionBlocks,
    courseBlock,
  };
}

/**
 * Builds a course with a single chapter and sequence, but no units.
 */
export function buildMinimalCourseBlocks(courseId, title, options = {}) {
  const sequenceBlocks = options.sequenceBlocks || [Factory.build(
    'block',
    { display_name: 'Title of Sequence', type: 'sequential' },
    { courseId },
  )];
  const sectionBlocks = options.sectionBlocks || [Factory.build(
    'block',
    {
      type: 'chapter',
      display_name: 'Title of Section',
      complete: options.complete || false,
      effort_time: 15,
      effort_activities: 2,
      resume_block: options.resumeBlock || false,
      children: sequenceBlocks.map(block => block.id),
    },
    { courseId },
  )];
  const courseBlock = options.courseBlock || Factory.build(
    'block',
    { type: 'course', display_name: title, children: sectionBlocks.map(block => block.id) },
    { courseId },
  );
  return {
    courseBlocks: options.courseBlocks || Factory.build(
      'courseBlocks',
      { courseId },
      {
        sequences: sequenceBlocks,
        sections: sectionBlocks,
        course: courseBlock,
        units: [],
      },
    ),
    unitBlocks: [],
    sequenceBlocks,
    sectionBlocks,
    courseBlock,
  };
}

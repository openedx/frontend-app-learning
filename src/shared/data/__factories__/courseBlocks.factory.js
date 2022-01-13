import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import './block.factory';

// Most of this file can be removed at some point, now that we rarely use course blocks
// in favor of learning sequences. But for now, these are mostly used to then feed into
// buildOutlineFromBlocks, which is an awkward flow if we don't really care about the
// course blocks themselves. A future cleanup to do.

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
        title,
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
    {
      display_name: 'Title of Sequence',
      effort_activities: 2,
      effort_time: 15,
      type: 'sequential',
    },
    { courseId },
  )];
  const sectionBlocks = options.sectionBlocks || [Factory.build(
    'block',
    {
      type: 'chapter',
      display_name: 'Title of Section',
      complete: options.complete || false,
      resume_block: options.resumeBlock || false,
      children: sequenceBlocks.map(block => block.id),
    },
    { courseId },
  )];
  const courseBlock = options.courseBlock || Factory.build(
    'block',
    {
      type: 'course',
      display_name: title,
      has_scheduled_content: options.hasScheduledContent || false,
      children: sectionBlocks.map(block => block.id),
    },
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

/**
 * Builds a course with two branches at each node. That is:
 *
 *                  Crs
 *                   |
 *        Sec--------+-------Sec
 *         |                  |
 *   Seq---+---Seq      Seq---+---Seq
 *    |         |        |         |
 * U--+--U   U--+--U  U--+--U   U--+--U
 *                          ^
 *
 * Each left branch is indexed 0, and each right branch is indexed 1.
 * So, the caret in the diagram above is pointing to `unitTree[1][0][1]`,
 * whose parent is `sequenceTree[1][0]`, whose parent is `sectionTree[1]`.
 */
export function buildBinaryCourseBlocks(courseId, title) {
  const sectionTree = [];
  const sequenceTree = [[], []];
  const unitTree = [[[], []], [[], []]];
  [0, 1].forEach(sectionIndex => {
    [0, 1].forEach(sequenceIndex => {
      [0, 1].forEach(unitIndex => {
        unitTree[sectionIndex][sequenceIndex][unitIndex] = Factory.build(
          'block',
          { type: 'vertical' },
          { courseId },
        );
      });
      sequenceTree[sectionIndex][sequenceIndex] = Factory.build(
        'block',
        { type: 'sequential', children: unitTree[sectionIndex][sequenceIndex].map(block => block.id) },
        { courseId },
      );
    });
    sectionTree[sectionIndex] = Factory.build(
      'block',
      { type: 'chapter', children: sequenceTree[sectionIndex].map(block => block.id) },
      { courseId },
    );
  });
  const courseBlock = Factory.build(
    'block',
    { type: 'course', display_name: title, children: sectionTree.map(block => block.id) },
    { courseId },
  );
  const sectionBlocks = [
    sectionTree[0],
    sectionTree[1],
  ];
  const sequenceBlocks = [
    sequenceTree[0][0],
    sequenceTree[0][1],
    sequenceTree[1][0],
    sequenceTree[1][1],
  ];
  const unitBlocks = [
    unitTree[0][0][0],
    unitTree[0][0][1],
    unitTree[0][1][0],
    unitTree[0][1][1],
    unitTree[1][0][0],
    unitTree[1][0][1],
    unitTree[1][1][0],
    unitTree[1][1][1],
  ];
  return {
    // Expose blocks as a combined list, lists separated by type, and as
    // trees separated by type. The caller can decide which they want to
    // work with.
    courseBlocks: Factory.build(
      'courseBlocks',
      { courseId, title },
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
    unitTree,
    sequenceTree,
    sectionTree,
  };
}

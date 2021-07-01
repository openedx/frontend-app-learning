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
  .option('sequences', ['courseId'], (courseId) => [
    Factory.build(
      'block',
      { type: 'sequential' },
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
    ['course', 'sections', 'sequences'],
    (course, sections, sequences) => ({
      [course.id]: course,
      ...getBlocks(sections),
      ...getBlocks(sequences),
    }),
  )
  .attr('root', ['course'], course => course.id);

/**
 * Builds a course with a single chapter and sequence.
 */
export function buildSimpleCourseBlocks(courseId, title, options = {}) {
  const sequenceBlocks = options.sequenceBlocks || [Factory.build(
    'block',
    { type: 'sequential' },
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
        sequences: sequenceBlocks,
        sections: sectionBlocks,
        course: courseBlock,
      },
    ),
    sequenceBlocks,
    sectionBlocks,
    courseBlock,
  };
}

/**
 * Builds a course with a single chapter and sequence (specifically for Course Home tests).
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
      },
    ),
    sequenceBlocks,
    sectionBlocks,
    courseBlock,
  };
}

/**
 * Builds a course outline with two branches at each node. That is:
 *
 *                  Crs
 *                   |
 *        Sec--------+-------Sec
 *         |                  |
 *   Seq---+---Seq      Seq---+---Seq
 *                      ^^^
 *
 * Each left branch is indexed 0, and each right branch is indexed 1.
 * So, the carets in the diagram above point to `seuqenceTree[1][0]`,
 * whose parent is `sectionTree[1]`.
 */
export function buildBinaryCourseBlocks(courseId, title) {
  const sectionTree = [];
  const sequenceTree = [[], []];
  [0, 1].forEach(sectionIndex => {
    [0, 1].forEach(sequenceIndex => {
      sequenceTree[sectionIndex][sequenceIndex] = Factory.build(
        'block',
        { type: 'sequential' },
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
  return {
    // Expose blocks as a combined list, lists separated by type, and as
    // trees separated by type. The caller can decide which they want to
    // work with.
    courseBlocks: Factory.build(
      'courseBlocks',
      { courseId },
      {
        sequences: sequenceBlocks,
        sections: sectionBlocks,
        course: courseBlock,
      },
    ),
    sequenceBlocks,
    sectionBlocks,
    courseBlock,
    sequenceTree,
    sectionTree,
  };
}

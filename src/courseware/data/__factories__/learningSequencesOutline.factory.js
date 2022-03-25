import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('learningSequencesOutline')
  .attrs({
    title: 'Demo Course',
    course_id: 'course-v1:edX+DemoX+Demo_Course',
    outline: {
      sections: [],
      sequences: {
      },
    },
  });

export function buildEmptyOutline(courseId) {
  return Factory.build(
    'learningSequencesOutline',
    {
      title: 'Demo Course',
      course_id: courseId,
      outline: {
        sections: [],
        sequences: {
        },
      },
    },
    { courseId },
  );
}

// Given courseBlocks (output from buildSimpleCourseBlocks), create a matching
// Learning Sequences API outline (what the REST API would return to us).
// Ideally this method would go away at some point, and we'd use a learning
// sequence factory directly. But this method exists as a bridge-gap from
// when course blocks were always used anyway. Now that they are rarely used,
// this can probably go away.
export function buildOutlineFromBlocks(courseBlocks) {
  const sections = {};
  const sequences = {};
  let courseBlock = null;

  Object.values(courseBlocks.blocks).forEach(block => {
    if (block.type === 'course') {
      courseBlock = block;
    } else if (block.type === 'chapter') {
      sections[block.id] = {
        id: block.id,
        title: block.display_name,
        start: null,
        effective_start: null,
        sequence_ids: [...block.children],
      };
    } else if (block.type === 'sequential') {
      sequences[block.id] = {
        id: block.id,
        title: block.display_name,
        accessible: true,
        start: null,
        effective_start: null,
      };
    }
  });

  const outline = Factory.build(
    'learningSequencesOutline',
    {
      course_key: courseBlocks.courseId,
      title: courseBlocks.title,
      outline: {
        sections: courseBlock.children.map(sectionId => sections[sectionId]),
        sequences,
      },
    },
    {},
  );

  return outline;
}

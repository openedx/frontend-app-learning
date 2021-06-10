import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('learningSequencesOutline')
  .option('courseId', (courseId) => {
    if (courseId) {
      return courseId;
    }
    throw new Error('courseId must be specified for learningSequencesOutline factory.');
  })
  .attrs({
    outline: {
      sequences: {
      },
    },
  });

export function buildEmptyOutline(courseId) {
  return Factory.build(
    'learningSequencesOutline',
    {},
    { courseId },
  );
}

export function buildSimpleOutline(courseId, sequenceBlocks) {
  return Factory.build(
    'learningSequencesOutline',
    {
      outline: {
        sequences: Object.fromEntries(
          sequenceBlocks.map(({ id }) => [id, {}]),
        ),
      },
    },
    { courseId },
  );
}

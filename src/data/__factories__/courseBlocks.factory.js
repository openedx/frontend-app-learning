import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import './block.factory';

Factory.define('courseBlocks')
  .option('courseId', 'course-v1:edX+DemoX+Demo_Course')
  .option('unit', ['courseId'], courseId => Factory.build(
    'block',
    { type: 'vertical' },
    { courseId },
  ))
  .option('sequence', ['courseId', 'unit'], (courseId, child) => Factory.build(
    'block',
    { type: 'sequential', children: [child.id] },
    { courseId },
  ))
  .option('section', ['courseId', 'sequence'], (courseId, child) => Factory.build(
    'block',
    { type: 'chapter', children: [child.id] },
    { courseId },
  ))
  .option('course', ['courseId', 'section'], (courseId, child) => Factory.build(
    'block',
    { type: 'course', children: [child.id] },
    { courseId },
  ))
  .attr(
    'blocks',
    ['course', 'section', 'sequence', 'unit'],
    (course, section, sequence, unit) => ({
      [course.id]: course,
      [section.id]: section,
      [sequence.id]: sequence,
      [unit.id]: unit,
    }),
  )
  .attr('root', ['course'], course => course.id);

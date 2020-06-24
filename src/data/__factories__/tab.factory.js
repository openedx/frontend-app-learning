import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('tab')
  .option('courseId', 'course-v1:edX+DemoX+Demo_Course')
  .option('path', 'course/')
  .attrs({
    title: 'Course',
    priority: 0,
    slug: 'courseware',
    type: 'courseware',
  })
  .attr(
    'url',
    ['courseId', 'path'],
    (courseId, path) => `/courses/${courseId}/${path}`,
  );

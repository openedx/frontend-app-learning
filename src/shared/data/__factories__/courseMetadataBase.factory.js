/* A basic course metadata factory, to be specialized in courseware and course-home., */

import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import './tab.factory';

export default new Factory()
  .sequence('id', (i) => `course-v1:edX+DemoX+Demo_Course_${i}`)
  .option('host')
  .attrs({
    is_staff: false,
    original_user_is_staff: false,
    number: 'DemoX',
    org: 'edX',
    verified_mode: {
      upgrade_url: 'test',
      price: 10,
      currency_symbol: '$',
    },
  })
  .attr(
    'tabs', ['id', 'host'], (id, host) => {
      const tabs = [
        Factory.build(
          'tab',
          {
            title: 'Course',
            priority: 0,
            slug: 'courseware',
            type: 'courseware',
          },
          { courseId: id, host, path: 'course/' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Discussion',
            priority: 1,
            slug: 'discussion',
            type: 'discussion',
          },
          { courseId: id, host, path: 'discussion/forum/' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Wiki',
            priority: 2,
            slug: 'wiki',
            type: 'wiki',
          },
          { courseId: id, host, path: 'course_wiki' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Progress',
            priority: 3,
            slug: 'progress',
            type: 'progress',
          },
          { courseId: id, host, path: 'progress' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Instructor',
            priority: 4,
            slug: 'instructor',
            type: 'instructor',
          },
          { courseId: id, host, path: 'instructor' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Dates',
            priority: 5,
            slug: 'dates',
            type: 'dates',
          },
          { courseId: id, host, path: 'dates' },
        ),
      ];

      return tabs;
    },
  );

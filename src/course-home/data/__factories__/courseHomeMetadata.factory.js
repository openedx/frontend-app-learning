import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('courseHomeMetadata')
  .sequence(
    'courseId', (courseId) => `course-v1:edX+DemoX+Demo_Course_${courseId}`,
  )
  .option('host', 'http://localhost:18000')
  .attrs({
    is_staff: false,
    original_user_is_staff: false,
    number: 'DemoX',
    org: 'edX',
    title: 'Demonstration Course',
    is_self_paced: false,
    is_enrolled: false,
    can_load_courseware: false,
  })
  .attr(
    'tabs', ['courseId', 'host'], (courseId, host) => {
      const tabs = [
        Factory.build(
          'tab',
          {
            title: 'Course',
            priority: 0,
            slug: 'courseware',
            type: 'courseware',
          },
          { courseId, path: 'course/' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Discussion',
            priority: 1,
            slug: 'discussion',
            type: 'discussion',
          },
          { courseId, path: 'discussion/forum/' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Wiki',
            priority: 2,
            slug: 'wiki',
            type: 'wiki',
          },
          { courseId, path: 'course_wiki' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Progress',
            priority: 3,
            slug: 'progress',
            type: 'progress',
          },
          { courseId, path: 'progress' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Instructor',
            priority: 4,
            slug: 'instructor',
            type: 'instructor',
          },
          { courseId, path: 'instructor' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Dates',
            priority: 5,
            slug: 'dates',
            type: 'dates',
          },
          { courseId, path: 'dates' },
        ),
      ];

      return tabs.map(
        tab => ({
          tab_id: tab.slug,
          title: tab.title,
          url: `${host}${tab.url}`,
        }),
      );
    },
  );

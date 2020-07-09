import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('courseHomeMetadata')
  .sequence(
    'course_id',
    (courseId) => `course-v1:edX+DemoX+Demo_Course_${courseId}`,
  )
  .option('courseTabs', [])
  .option('host', 'http://localhost:18000')
  .attrs({
    is_staff: false,
    number: 'DemoX',
    org: 'edX',
    title: 'Demonstration Course',
    is_self_paced: false,
  })
  .attr('tabs', ['courseTabs', 'host'], (courseTabs, host) => courseTabs.map(
    tab => ({
      tab_id: tab.slug,
      title: tab.title,
      url: `${host}${tab.url}`,
    }),
  ));

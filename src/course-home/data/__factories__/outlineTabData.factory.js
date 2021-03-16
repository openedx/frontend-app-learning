import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import buildSimpleCourseBlocks from './courseBlocks.factory';

Factory.define('outlineTabData')
  .option('courseId', 'course-v1:edX+DemoX+Demo_Course')
  .option('host', 'http://localhost:18000')
  .option('dateBlocks', [])
  .attr('course_tools', ['host', 'courseId'], (host, courseId) => ([{
    analytics_id: 'edx.bookmarks',
    title: 'Bookmarks',
    url: `${host}/courses/${courseId}/bookmarks/`,
  }]))
  .attr('course_blocks', ['courseId'], courseId => {
    const { courseBlocks } = buildSimpleCourseBlocks(courseId);
    return {
      blocks: courseBlocks.blocks,
    };
  })
  .attr('dates_widget', ['dateBlocks'], (dateBlocks) => ({
    course_date_blocks: dateBlocks,
    user_timezone: 'UTC',
  }))
  .attr('resume_course', ['host', 'courseId'], (host, courseId) => ({
    has_visited_course: false,
    url: `${host}/courses/${courseId}/jump_to/block-v1:edX+Test+Block@12345abcde`,
  }))
  .attr('verified_mode', ['host'], (host) => ({
    access_expiration_date: '2050-01-01T12:00:00',
    currency: 'USD',
    currency_symbol: '$',
    price: 149,
    sku: 'ABCD1234',
    upgrade_url: `${host}/dashboard`,
  }))
  .attrs({
    access_expiration: null,
    can_show_upgrade_sock: false,
    course_goals: {
      goal_options: [],
      selected_goal: null,
    },
    dates_banner_info: {
      content_type_gating_enabled: false,
      missed_gated_content: false,
      missed_deadlines: false,
    },
    enroll_alert: {
      can_enroll: true,
      extra_text: 'Contact the administrator.',
    },
    handouts_html: '<ul><li>Handout 1</li></ul>',
    offer: null,
    welcome_message_html: '<p>Welcome to this course!</p>',
  });

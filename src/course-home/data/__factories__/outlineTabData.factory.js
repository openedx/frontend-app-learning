import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import buildSimpleCourseBlocks from './courseBlocks.factory';

Factory.define('outlineTabData')
  .option('courseId', 'course-v1:edX+DemoX+Demo_Course')
  .option('host', 'http://localhost:18000')
  .attr('course_expired_html', [], () => '<div>Course expired</div>')
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
  .attr('course_goals', [], () => ({
    goal_options: [],
    selected_goal: {},
  }))
  .attr('enroll_alert', {
    can_enroll: true,
    extra_text: 'Contact the administrator.',
  })
  .attr('dates_widget', {
    courseDateBlocks: [],
    userTimezone: 'UTC',
  })
  .attr('handouts_html', [], () => '<ul><li>Handout 1</li></ul>')
  .attr('offer_html', [], () => '<div>Great offer here</div>')
  .attr('resume_course', ['host', 'courseId'], (host, courseId) => ({
    has_visited_course: false,
    url: `${host}/courses/${courseId}/jump_to/block-v1:edX+Test+Block@12345abcde`,
  }))
  .attr('welcome_message_html', [], () => '<p>Welcome to this course!</p>');

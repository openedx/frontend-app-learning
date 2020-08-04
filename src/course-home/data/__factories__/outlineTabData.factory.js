import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import buildSimpleCourseBlocks from '../../../courseware/data/__factories__/courseBlocks.factory';

Factory.define('outlineTabData')
  .option('courseId', 'course-v1:edX+DemoX+Demo_Course')
  .option('host', 'http://localhost:18000')
  .attr('course_tools', ['host', 'courseId'], (host, courseId) => ({
    analytics_id: 'edx.bookmarks',
    title: 'Bookmarks',
    url: `${host}/courses/${courseId}/bookmarks/`,
  }))
  .attr('course_blocks', ['courseId'], courseId => {
    const { courseBlocks } = buildSimpleCourseBlocks(courseId);
    return {
      blocks: courseBlocks.blocks,
    };
  })
  .attr('enroll_alert', {
    can_enroll: true,
    extra_text: 'Contact the administrator.',
  })
  .attr('handouts_html', [], () => '<ul><li>Handout 1</li></ul>')
  .attr('offer_html', [], () => '<div>Great offer here</div>');

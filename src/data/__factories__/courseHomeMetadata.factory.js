import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('course_home_metadata')
  .sequence(
    'course_id',
    (courseId) => `course-v1:edX+DemoX+Demo_Course_${courseId}`,
  )
  .attrs({
    is_staff: false,
    number: 'DemoX',
    org: 'edX',
    // tabs: [
    //   {
    //     'tab_id': 'courseware',
    //     'title': 'Course',
    //     'url': 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/course/'
    //   },
    //   {
    //     'tab_id': 'discussion',
    //     'title': 'Discussion',
    //     'url': 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/discussion/forum/'
    //   },
    //   {
    //     'tab_id': 'wiki',
    //     'title': 'Wiki',
    //     'url': 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/course_wiki'
    //   },
    //   {
    //     'tab_id': 'progress',
    //     'title': 'Progress',
    //     'url': 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/progress'
    //   },
    //   {
    //     'tab_id': 'instructor',
    //     'title': 'Instructor',
    //     'url': 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/instructor'
    //   }
    // ],
    title: 'Demonstration Course',
    is_self_paced: false,
  });

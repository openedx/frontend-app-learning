import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import courseMetadataBase from '../../../shared/data/__factories__/courseMetadataBase.factory';

Factory.define('courseHomeMetadata')
  .extend(courseMetadataBase)
  .option('host', 'http://localhost:18000')
  .attrs({
    title: 'Demonstration Course',
    is_self_paced: false,
    is_enrolled: false,
    is_staff: false,
    can_load_courseware: true,
    celebrations: null,
    course_access: {
      additional_context_user_message: null,
      developer_message: null,
      error_code: null,
      has_access: true,
      user_fragment: null,
      user_message: null,
    },
    number: 'DemoX',
    original_user_is_staff: false,
    org: 'edX',
    start: '2013-02-05T05:00:00Z',
    user_timezone: 'UTC',
    username: 'MockUser',
    verified_mode: {
      access_expiration_date: null,
      currency: 'USD',
      upgrade_url: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      sku: '8CF08E5',
      price: 149,
      currency_symbol: '$',
    },
  })
  .attr(
    'tabs', ['id', 'host'], (id, host) => [
      Factory.build(
        'tab',
        {
          title: 'Course',
          priority: 0,
          slug: 'courseware',
          type: 'courseware',
        },
        {
          courseId: id,
          host,
          path: 'course/',
        },
      ),
      Factory.build(
        'tab',
        {
          title: 'Discussion',
          priority: 1,
          slug: 'discussion',
          type: 'discussion',
        },
        {
          courseId: id,
          host,
          path: 'discussion/forum/',
        },
      ),
      Factory.build(
        'tab',
        {
          title: 'Wiki',
          priority: 2,
          slug: 'wiki',
          type: 'wiki',
        },
        {
          courseId: id,
          host,
          path: 'course_wiki',
        },
      ),
      Factory.build(
        'tab',
        {
          title: 'Progress',
          priority: 3,
          slug: 'progress',
          type: 'progress',
        },
        {
          courseId: id,
          host,
          path: 'progress',
        },
      ),
      Factory.build(
        'tab',
        {
          title: 'Instructor',
          priority: 4,
          slug: 'instructor',
          type: 'instructor',
        },
        {
          courseId: id,
          host,
          path: 'instructor',
        },
      ),
      Factory.build(
        'tab',
        {
          title: 'Dates',
          priority: 5,
          slug: 'dates',
          type: 'dates',
        },
        {
          courseId: id,
          host,
          path: 'dates',
        },
      ),
    ],
  );

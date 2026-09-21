import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import courseMetadataBase from '../../../shared/data/__factories__/courseMetadataBase.factory';

Factory.define('courseHomeMetadata')
  .extend(courseMetadataBase)
  .option('host', 'http://localhost:18000')
  .attrs({
    title: 'Demonstration Course',
    is_new_discussion_sidebar_view_enabled: false,
    is_self_paced: false,
    is_enrolled: false,
    is_staff: false,
    can_view_certificate: true,
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
  .attr('tabs', ['id', 'host'], (id, host) => [
    Factory.build(
      'tab',
      {
        title: 'Course',
        tab_id: 'courseware',
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
        tab_id: 'discussion',
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
        tab_id: 'wiki',
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
        tab_id: 'progress',
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
        tab_id: 'instructor',
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
        tab_id: 'dates',
      },
      {
        courseId: id,
        host,
        path: 'dates',
      },
    ),
  ]);

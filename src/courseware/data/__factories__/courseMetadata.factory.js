import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import './tab.factory';

Factory.define('courseMetadata')
  .sequence('id', (id) => `course-v1:edX+DemoX+Demo_Course_${id}`)
  .attrs({
    can_show_upgrade_sock: false,
    content_type_gating_enabled: false,
    course_expired_message: null,
    effort: null,
    end: null,
    enrollment_start: null,
    enrollment_end: null,
    name: 'Demonstration Course',
    number: 'DemoX',
    offer_html: null,
    org: 'edX',
    short_description: null,
    start: '2013-02-05T05:00:00Z',
    start_display: 'Feb. 5, 2013',
    start_type: 'timestamp',
    pacing: 'instructor',
    enrollment: {
      mode: null,
      is_active: null,
    },
    verified_mode: {
      currency: 'USD',
      upgrade_url: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      sku: '8CF08E5',
      price: 149,
      currency_symbol: '$',
    },
    show_calculator: false,
    is_staff: false,
    original_user_is_staff: false,
    license: 'all-rights-reserved',
    can_load_courseware: {
      has_access: true,
      user_fragment: null,
      developer_message: null,
      user_message: null,
      error_code: null,
      additional_context_user_message: null,
    },
    notes: {
      visible: true,
      enabled: false,
    },
    marketing_url: null,
    celebrations: null,
    enroll_alert: null,
    course_exit_page_is_active: true,
    user_has_passing_grade: false,
    certificate_data: {
      cert_status: 'audit_passing',
    },
  }).attr(
    'tabs', ['tabs', 'id'], (passedTabs, id) => {
      if (passedTabs) {
        return passedTabs;
      }

      const tabs = [
        Factory.build(
          'tab',
          {
            title: 'Course',
            priority: 0,
            slug: 'courseware',
            type: 'courseware',
          },
          { courseId: id, path: 'course/' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Discussion',
            priority: 1,
            slug: 'discussion',
            type: 'discussion',
          },
          { courseId: id, path: 'discussion/forum/' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Wiki',
            priority: 2,
            slug: 'wiki',
            type: 'wiki',
          },
          { courseId: id, path: 'course_wiki' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Progress',
            priority: 3,
            slug: 'progress',
            type: 'progress',
          },
          { courseId: id, path: 'progress' },
        ),
        Factory.build(
          'tab',
          {
            title: 'Instructor',
            priority: 4,
            slug: 'instructor',
            type: 'instructor',
          },
          { courseId: id, path: 'instructor' },
        ),
      ];

      return tabs;
    },
  );

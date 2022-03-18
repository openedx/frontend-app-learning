import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import courseMetadataBase from '../../../shared/data/__factories__/courseMetadataBase.factory';

Factory.define('courseMetadata')
  .extend(courseMetadataBase)
  .option('host', '')
  .attrs({
    access_expiration: {
      expiration_date: '2032-02-22T05:00:00Z',
    },
    content_type_gating_enabled: false,
    course_expired_message: null,
    course_goals: {
      goal_options: [],
      selected_goal: {
        days_per_week: 1,
        subscribed_to_reminders: true,
      },
    },
    end: null,
    enrollment_start: null,
    enrollment_end: null,
    name: 'Demonstration Course',
    offer_html: null,
    short_description: null,
    start: '2013-02-05T05:00:00Z',
    start_display: 'Feb. 5, 2013',
    start_type: 'timestamp',
    pacing: 'instructor',
    enrollment: {
      mode: null,
      is_active: null,
    },
    show_calculator: false,
    license: 'all-rights-reserved',
    notes: {
      visible: true,
      enabled: false,
    },
    marketing_url: null,
    celebrations: null,
    enroll_alert: null,
    course_exit_page_is_active: true,
    user_has_passing_grade: false,
    certificate_data: null,
    entrance_exam_data: {
      entrance_exam_current_score: 0.0,
      entrance_exam_enabled: false,
      entrance_exam_id: '',
      entrance_exam_minimum_score_pct: 0.65,
      entrance_exam_passed: true,
    },
    verify_identity_url: null,
    verification_status: 'none',
    linkedin_add_to_profile_url: null,
    related_programs: null,
    user_needs_integrity_signature: false,
    recommendations: null,
  });

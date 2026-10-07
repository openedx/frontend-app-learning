import { Factory } from 'rosie';

// The payload shapes `@edx/frontend-lib-special-exams` tests itself with, ported from its
// `src/data/__factories__/` at 4.1.0 (`exam`, `attempt`, `proctoringSettings`, `examAccessToken`).
// The library ships them in `dist/data/__factories__/`, but its `exports` map exposes only
// `dist/index.js`, so they cannot be imported from the package.

Factory.define('specialExamAttempt')
  .attrs({
    attempt_id: 1,
    attempt_status: 'started',
    in_timed_exam: true,
    taking_as_proctored: false,
    exam_display_name: 'a timed exam',
    exam_type: 'timed',
    exam_url_path: 'http://localhost:2000/course/course-v1:test+special+exam/block-v1:test+special+exam+type@sequential+block@abc123',
    time_remaining_seconds: 1799.9,
    course_id: 'course-v1:test+special+exam',
    exam_started_poll_url: '/api/edx_proctoring/v1/proctored_exam/attempt/1',
    desktop_application_js_url: '',
    attempt_code: '',
    software_download_url: '',
    total_time: '30 minutes',
  });

Factory.define('specialExam')
  .attr('attempt', {})
  .attr('prerequisite_status', {
    are_prerequisites_satisifed: true,
    satisfied_prerequisites: [],
    failed_prerequisites: [],
    pending_prerequisites: [],
    declined_prerequisites: [],
  })
  .attrs({
    id: 1,
    exam_name: 'prock exam',
    course_id: 'course-v1:test+special+exam',
    content_id: 'block-v1:test+special+exam+type@sequential+block@abc123',
    external_id: null,
    time_limit_mins: 30,
    total_time: '30 minutes',
    is_proctored: false,
    is_practice_exam: false,
    is_active: true,
    type: 'timed',
    due_date: null,
    hide_after_due: false,
    backend: 'test',
  });

Factory.define('specialExamProctoringSettings')
  .attrs({
    exam_proctoring_backend: {
      download_url: '',
      instructions: [],
      name: '',
      rules: {},
    },
    provider_tech_support_email: '',
    provider_tech_support_phone: '',
    provider_name: '',
    learner_notification_from_email: '',
    integration_specific_email: '',
  });

Factory.define('specialExamAccessToken')
  .attrs({
    exam_access_token: 'Z173480948902JK34432',
    exam_access_token_expiration: '60',
  });

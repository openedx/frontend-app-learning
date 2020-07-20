import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('datesTabData')
  .attrs({
    dates_banner_info: {
      content_type_gating_enabled: false,
      missed_gated_content: false,
      missed_deadlines: false,
    },
    course_date_blocks: [
      {
        date: '2013-02-05T05:00:00Z',
        date_type: 'course-start-date',
        description: '',
        learner_has_access: true,
        link: '',
        title: 'Course Starts',
        extraInfo: '',
      },
    ],
    missed_deadlines: false,
    missed_gated_content: false,
    learner_is_full_access: true,
    user_timezone: null,
    verified_upgrade_link: 'http://localhost:18130/basket/add/?sku=8CF08E5',
  });

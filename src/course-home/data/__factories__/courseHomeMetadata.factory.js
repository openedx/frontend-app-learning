import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import courseMetadataBase from '../../../shared/data/__factories__/courseMetadataBase.factory';

Factory.define('courseHomeMetadata')
  .extend(courseMetadataBase)
  .option('host', 'http://localhost:18000')
  .attrs({
    title: 'Demonstration Course',
    is_self_paced: false,
    is_enrolled: false,
    can_load_courseware: false,
    course_access: {
      additional_context_user_message: null,
      developer_message: null,
      error_code: null,
      has_access: true,
      user_fragment: null,
      user_message: null,
    },
    start: '2013-02-05T05:00:00Z',
    user_timezone: 'UTC',
  });

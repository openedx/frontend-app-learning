/* A basic course metadata factory, to be specialized in courseware and course-home., */

import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import './tab.factory';

export default new Factory()
  .option('host')
  .attrs({
    id: 'course-v1:edX+DemoX+Demo_Course',
    is_staff: false,
    original_user_is_staff: false,
    number: 'DemoX',
    org: 'edX',
    verified_mode: {
      upgrade_url: 'test',
      price: 10,
      currency_symbol: '$',
    },
  });

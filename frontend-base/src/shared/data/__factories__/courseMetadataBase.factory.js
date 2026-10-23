/* A basic course metadata factory, to be specialized in courseware and course-home., */

import { Factory } from 'rosie';

import './tab.factory';

export default new Factory()
  .option('host')
  .attrs({
    id: 'course-v1:edX+DemoX+Demo_Course',
  });

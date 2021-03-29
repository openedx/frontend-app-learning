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
  });

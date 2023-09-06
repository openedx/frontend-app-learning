/*
  Test Exports:
  This module exports anything that needs to be reused for testing
  but we don't want to be on production builds.

  This is required because some test modules execute code by just
  importing them that creates global objects (like mock factories)
  that we don't want to include on production.
*/

import * as courseMetadataFactory from './courseware/data/__factories__/courseMetadata.factory';
import * as sequenceMetadataFactory from './courseware/data/__factories__/sequenceMetadata.factory';
import * as learningSequencesOutlineFactory from './courseware/data/__factories__/learningSequencesOutline.factory';
import * as courseHomeFactories from './course-home/data/__factories__';

export {
  courseMetadataFactory,
  sequenceMetadataFactory,
  learningSequencesOutlineFactory,
  courseHomeFactories,
};

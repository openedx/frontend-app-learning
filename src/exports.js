import Sequence from './courseware/course/sequence';
import CompleteIcon from './courseware/course/sequence/sequence-navigation/CompleteIcon';
import { reducer as courseHomeReducer } from './course-home/data';
import { reducer as coursewareReducer } from './courseware/data/slice';
import { reducer as recommendationsReducer } from './courseware/course/course-exit/data/slice';
import { reducer as toursReducer } from './product-tours/data';
import { reducer as modelsReducer } from './generic/model-store';
import CourseLicense from './courseware/course/course-license';
import {
  fetchCourse,
  fetchSequence,
  checkBlockCompletion,
  saveSequencePosition,
  getResumeBlock,
  getSequenceForUnitDeprecated,
} from './courseware/data';

export {
  Sequence,
  CompleteIcon,
  courseHomeReducer,
  coursewareReducer,
  recommendationsReducer,
  toursReducer,
  modelsReducer,
  CourseLicense,
  fetchCourse,
  fetchSequence,
  checkBlockCompletion,
  saveSequencePosition,
  getResumeBlock,
  getSequenceForUnitDeprecated,
};

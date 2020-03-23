import { logError } from '@edx/frontend-platform/logging';
import {
  getCourseMetadata,
  getCourseBlocks,
  getSequenceMetadata,
} from './api';
import {
  addModelsMap, updateModel, updateModels, updateModelsMap,
} from '../model-store';
import {
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
} from './slice';

export function fetchCourse(courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseRequest({ courseId }));
    Promise.all([
      getCourseBlocks(courseId),
      getCourseMetadata(courseId),
    ]).then(([
      {
        courses, sections, sequences, units,
      },
      course,
    ]) => {
      dispatch(addModelsMap({
        modelType: 'courses',
        modelsMap: courses,
      }));
      dispatch(updateModel({
        modelType: 'courses',
        model: course,
      }));
      dispatch(addModelsMap({
        modelType: 'sections',
        modelsMap: sections,
      }));
      // We update for sequences and units because the sequence metadata may have come back first.
      dispatch(updateModelsMap({
        modelType: 'sequences',
        modelsMap: sequences,
      }));
      dispatch(updateModelsMap({
        modelType: 'units',
        modelsMap: units,
      }));
      dispatch(fetchCourseSuccess({ courseId }));
    }).catch((error) => {
      logError(error);
      dispatch(fetchCourseFailure({ courseId }));
    });
  };
}

export function fetchSequence(sequenceId) {
  return async (dispatch) => {
    dispatch(fetchSequenceRequest({ sequenceId }));
    try {
      const { sequence, units } = await getSequenceMetadata(sequenceId);
      dispatch(updateModel({
        modelType: 'sequences',
        model: sequence,
      }));
      dispatch(updateModels({
        modelType: 'units',
        models: units,
      }));
      dispatch(fetchSequenceSuccess({ sequenceId }));
    } catch (error) {
      logError(error);
      dispatch(fetchSequenceFailure({ sequenceId }));
    }
  };
}

import { logError } from '@edx/frontend-platform/logging';
import {
  getCourseMetadata,
  getCourseBlocks,
  getSequenceMetadata,
} from './api';
import {
  addModelsMap, updateModel, updateModels,
} from '../model-store';
import {
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
} from './slice';

export function fetchCourse(courseUsageKey) {
  return async (dispatch) => {
    dispatch(fetchCourseRequest({ courseUsageKey }));
    Promise.all([
      getCourseBlocks(courseUsageKey),
      getCourseMetadata(courseUsageKey),
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
      dispatch(addModelsMap({
        modelType: 'sequences',
        modelsMap: sequences,
      }));
      dispatch(addModelsMap({
        modelType: 'units',
        modelsMap: units,
      }));
      dispatch(fetchCourseSuccess({ courseUsageKey }));
    }).catch((error) => {
      logError(error);
      dispatch(fetchCourseFailure({ courseUsageKey }));
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

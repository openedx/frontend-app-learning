import { logError } from '@edx/frontend-platform/logging';
import {
  getCourseMetadata,
  getCourseBlocks,
  getSequenceMetadata,
} from './api';
import {
  addModelsMap, updateModel, updateModels, updateModelsMap, addModel,
} from '../model-store';
import {
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchCourseDenied,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
} from './slice';

export function fetchCourse(courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseRequest({ courseId }));
    Promise.allSettled([
      getCourseMetadata(courseId),
      getCourseBlocks(courseId),
    ]).then(([courseMetadataResult, courseBlocksResult]) => {
      if (courseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'courses',
          model: courseMetadataResult.value,
        }));
      }

      if (courseBlocksResult.status === 'fulfilled') {
        const {
          courses, sections, sequences, units,
        } = courseBlocksResult.value;

        dispatch(updateModelsMap({
          modelType: 'courses',
          modelsMap: courses,
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
      }

      const fetchedMetadata = courseMetadataResult.status === 'fulfilled';
      const fetchedBlocks = courseBlocksResult.status === 'fulfilled';

      // Log errors for each request if needed. Course block failures may occur
      // even if the course metadata request is successful
      if (!fetchedBlocks) {
        logError(courseBlocksResult.reason);
      }
      if (!fetchedMetadata) {
        logError(courseMetadataResult.reason);
      }

      if (fetchedMetadata) {
        if (courseMetadataResult.value.canLoadCourseware.hasAccess && fetchedBlocks) {
          // User has access
          dispatch(fetchCourseSuccess({ courseId }));
          return;
        }
        // User either doesn't have access or only has partial access
        // (can't access course blocks)
        dispatch(fetchCourseDenied({ courseId }));
        return;
      }

      // Definitely an error happening
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

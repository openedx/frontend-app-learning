import { logError } from '@edx/frontend-platform/logging';
import {
  getCourseMetadata,
  getCourseBlocks,
  getSequenceMetadata,
  getBlockCompletion,
  updateSequencePosition,
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

export function checkBlockCompletion(courseUsageKey, sequenceId, unitId) {
  return async (dispatch, getState) => {
    const { models } = getState();
    if (models.units[unitId].complete) {
      return; // do nothing. Things don't get uncompleted after they are completed.
    }

    try {
      const isComplete = await getBlockCompletion(courseUsageKey, sequenceId, unitId);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          complete: isComplete,
        },
      }));
    } catch (error) {
      logError(error);
    }
  };
}

export function saveSequencePosition(courseUsageKey, sequenceId, position) {
  return async (dispatch, getState) => {
    const { models } = getState();
    const initialPosition = models.sequences[sequenceId].position;
    // Optimistically update the position.
    dispatch(updateModel({
      modelType: 'sequences',
      model: {
        id: sequenceId,
        position,
      },
    }));
    try {
      await updateSequencePosition(courseUsageKey, sequenceId, position);
      // Update again under the assumption that the above call succeeded, since it doesn't return a
      // meaningful response.
      dispatch(updateModel({
        modelType: 'sequences',
        model: {
          id: sequenceId,
          position,
        },
      }));
    } catch (error) {
      logError(error);
      dispatch(updateModel({
        modelType: 'sequences',
        model: {
          id: sequenceId,
          position: initialPosition,
        },
      }));
    }
  };
}

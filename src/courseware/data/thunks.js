import { logError } from '@edx/frontend-platform/logging';
import {
  getBlockCompletion,
  postSequencePosition,
} from './api';
import {
  updateModel,
} from '../../generic/model-store';

export function checkBlockCompletion(courseId, sequenceId, unitId) {
  return async (dispatch, getState) => {
    const { models } = getState();
    if (models.units[unitId].complete) {
      return; // do nothing. Things don't get uncompleted after they are completed.
    }

    try {
      const isComplete = await getBlockCompletion(courseId, sequenceId, unitId);
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

export function saveSequencePosition(courseId, sequenceId, position) {
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
      await postSequencePosition(courseId, sequenceId, position);
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

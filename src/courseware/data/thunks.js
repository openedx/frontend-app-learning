import { logError } from '@edx/frontend-platform/logging';
import {
  getBlockCompletion,
  updateSequencePosition,
} from './api';
import {
  updateModel,
} from '../../model-store';

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

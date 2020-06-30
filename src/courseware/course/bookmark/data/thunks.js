import { logError } from '@edx/frontend-platform/logging';
import {
  createBookmark,
  deleteBookmark,
} from './api';
import { updateModel } from '../../../../generic/model-store';

export function addBookmark(unitId) {
  return async (dispatch) => {
    // Optimistically update the bookmarked flag.
    dispatch(updateModel({
      modelType: 'units',
      model: {
        id: unitId,
        bookmarked: true,
        bookmarkedUpdateState: 'loading',
      },
    }));

    try {
      await createBookmark(unitId);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          bookmarked: true,
          bookmarkedUpdateState: 'loaded',
        },
      }));
    } catch (error) {
      logError(error);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          bookmarked: false,
          bookmarkedUpdateState: 'failed',
        },
      }));
    }
  };
}

export function removeBookmark(unitId) {
  return async (dispatch) => {
    // Optimistically update the bookmarked flag.
    dispatch(updateModel({
      modelType: 'units',
      model: {
        id: unitId,
        bookmarked: false,
        bookmarkedUpdateState: 'loading',
      },
    }));
    try {
      await deleteBookmark(unitId);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          bookmarked: false,
          bookmarkedUpdateState: 'loaded',
        },
      }));
    } catch (error) {
      logError(error);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          bookmarked: true,
          bookmarkedUpdateState: 'failed',
        },
      }));
    }
  };
}

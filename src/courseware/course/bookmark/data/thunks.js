import { logError } from '@edx/frontend-platform/logging';
import {
  createBookmark,
  deleteBookmark,
} from './api';
import { updateModel } from '../../../../generic/model-store';

export const BOOKMARK_LOADING = 'loading';
export const BOOKMARK_LOADED = 'loaded';
export const BOOKMARK_FAILED = 'failed';

export function addBookmark(unitId) {
  return async (dispatch) => {
    // Optimistically update the bookmarked flag.
    dispatch(updateModel({
      modelType: 'units',
      model: {
        id: unitId,
        bookmarked: true,
        bookmarkedUpdateState: BOOKMARK_LOADING,
      },
    }));

    try {
      await createBookmark(unitId);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          bookmarked: true,
          bookmarkedUpdateState: BOOKMARK_LOADED,
        },
      }));
    } catch (error) {
      logError(error);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          bookmarked: false,
          bookmarkedUpdateState: BOOKMARK_FAILED,
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
        bookmarkedUpdateState: BOOKMARK_LOADING,
      },
    }));
    try {
      await deleteBookmark(unitId);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          bookmarked: false,
          bookmarkedUpdateState: BOOKMARK_LOADED,
        },
      }));
    } catch (error) {
      logError(error);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          bookmarked: true,
          bookmarkedUpdateState: BOOKMARK_FAILED,
        },
      }));
    }
  };
}

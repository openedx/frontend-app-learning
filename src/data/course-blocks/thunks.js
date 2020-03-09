import { logError } from '@edx/frontend-platform/logging';
import {
  fetchCourseBlocksRequest,
  fetchCourseBlocksSuccess,
  fetchCourseBlocksFailure,
  fetchBlockMetadataRequest,
  fetchBlockMetadataSuccess,
  fetchBlockMetadataFailure,
  updateBlockRequest,
  updateBlockSuccess,
  updateBlockFailure,
} from './slice';
import {
  getCourseBlocks,
  getSequenceMetadata,
  getBlockCompletion,
  updateSequencePosition,
  createBookmark,
  deleteBookmark,
} from './api';

export function fetchCourseBlocks(courseUsageKey) {
  return async (dispatch) => {
    dispatch(fetchCourseBlocksRequest(courseUsageKey));
    try {
      const courseBlocks = await getCourseBlocks(courseUsageKey);
      dispatch(fetchCourseBlocksSuccess(courseBlocks));
    } catch (error) {
      logError(error);
      dispatch(fetchCourseBlocksFailure(courseUsageKey));
    }
  };
}

export function fetchSequenceMetadata(sequenceBlockId) {
  return async (dispatch) => {
    dispatch(fetchBlockMetadataRequest({ blockId: sequenceBlockId }));
    try {
      const sequenceMetadata = await getSequenceMetadata(sequenceBlockId);
      dispatch(fetchBlockMetadataSuccess({
        blockId: sequenceBlockId,
        metadata: sequenceMetadata,
        relatedBlocksMetadata: sequenceMetadata.items,
      }));
    } catch (error) {
      logError(error);
      dispatch(fetchBlockMetadataFailure({ blockId: sequenceBlockId }));
    }
  };
}

export function checkBlockCompletion(courseUsageKey, sequenceId, unitId) {
  return async (dispatch, getState) => {
    const { courseBlocks } = getState();
    if (courseBlocks.blocks[unitId].complete) {
      return; // do nothing. Things don't get uncompleted after they are completed.
    }
    const commonPayload = { blockId: unitId, fetchType: 'completion' };
    dispatch(fetchBlockMetadataRequest(commonPayload));
    try {
      const isComplete = await getBlockCompletion(courseUsageKey, sequenceId, unitId);
      dispatch(fetchBlockMetadataSuccess({
        ...commonPayload,
        metadata: {
          complete: isComplete,
        },
      }));
    } catch (error) {
      logError(error);
      dispatch(fetchBlockMetadataFailure(commonPayload));
    }
  };
}

export function saveSequencePosition(courseUsageKey, sequenceId, position) {
  return async (dispatch, getState) => {
    const { courseBlocks } = getState();
    const actionPayload = {
      blockId: sequenceId,
      propertyToUpdate: 'position',
      updateValue: position,
      initialValue: courseBlocks.blocks[sequenceId].position,
    };
    dispatch(updateBlockRequest(actionPayload));
    try {
      await updateSequencePosition(courseUsageKey, sequenceId, position);
      dispatch(updateBlockSuccess(actionPayload));
    } catch (error) {
      logError(error);
      dispatch(updateBlockFailure(actionPayload));
    }
  };
}

export function addBookmark(unitId) {
  return async (dispatch) => {
    const actionPayload = {
      blockId: unitId,
      propertyToUpdate: 'bookmarked',
      updateValue: true,
      initialValue: false,
    };
    dispatch(updateBlockRequest(actionPayload));
    try {
      await createBookmark(unitId);
      dispatch(updateBlockSuccess(actionPayload));
    } catch (error) {
      logError(error);
      dispatch(updateBlockFailure(actionPayload));
    }
  };
}

export function removeBookmark(unitId) {
  return async (dispatch) => {
    const actionPayload = {
      blockId: unitId,
      propertyToUpdate: 'bookmarked',
      updateValue: false,
      initialValue: true,
    };
    dispatch(updateBlockRequest(actionPayload));
    try {
      await deleteBookmark(unitId);
      dispatch(updateBlockSuccess(actionPayload));
    } catch (error) {
      logError(error);
      dispatch(updateBlockFailure(actionPayload));
    }
  };
}

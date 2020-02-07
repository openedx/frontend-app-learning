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
  createBookmark,
  deleteBookmark,
} from './api';

export const fetchCourseBlocks = courseUsageKey => async (dispatch) => {
  dispatch(fetchCourseBlocksRequest(courseUsageKey));
  try {
    const courseBlocks = await getCourseBlocks(courseUsageKey);
    dispatch(fetchCourseBlocksSuccess(courseBlocks));
  } catch (error) {
    dispatch(fetchCourseBlocksFailure(error));
  }
};

export const fetchSequenceMetadata = sequenceBlockId => async (dispatch) => {
  dispatch(fetchBlockMetadataRequest({ blockId: sequenceBlockId }));
  try {
    const sequenceMetadata = await getSequenceMetadata(sequenceBlockId);
    dispatch(fetchBlockMetadataSuccess({
      blockId: sequenceBlockId,
      metadata: sequenceMetadata,
      relatedBlocksMetadata: sequenceMetadata.items,
    }));
  } catch (error) {
    dispatch(fetchBlockMetadataFailure({ blockId: sequenceBlockId }, error));
  }
};

// eslint-disable-next-line arrow-body-style
export const checkBlockCompletion = (courseUsageKey, sequenceId, unitId) => {
  return async (dispatch, getState) => {
    const { courseBlocks } = getState();
    if (courseBlocks.blocks[unitId].complete) {
      return; // do nothing. Things don't get uncompleted after they are completed.
    }
    const isComplete = await getBlockCompletion(courseUsageKey, sequenceId, unitId);
    dispatch(fetchBlockMetadataSuccess({
      blockId: unitId,
      metadata: {
        complete: isComplete,
      },
    }));
  };
};

export const addBookmark = unitId => async (dispatch) => {
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
    dispatch(updateBlockFailure(actionPayload));
  }
};

export const removeBookmark = unitId => async (dispatch) => {
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
    dispatch(updateBlockFailure(actionPayload));
  }
};

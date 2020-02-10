/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const blocksSlice = createSlice({
  name: 'blocks',
  initialState: {
    fetchState: null,
    root: null,
    blocks: {},
  },
  reducers: {
    /**
     * fetchCourseBlocks
     * This routine is responsible for fetching all blocks in a course.
     */
    fetchCourseBlocksRequest: (draftState) => {
      draftState.fetchState = 'loading';
    },
    fetchCourseBlocksSuccess: (draftState, { payload }) => ({
      ...payload,
      fetchState: 'loaded',
      loaded: true,
    }),
    fetchCourseBlocksFailure: (draftState) => {
      draftState.fetchState = 'failed';
    },

    /**
     * fetchBlockMetadata
     * This routine is responsible for fetching metadata for any kind of
     * block (sequential, vertical or any other block) and merging that
     * data with what is in the store. Currently used for:
     *
     *  - fetchSequenceMetadata
     *  - checkBlockCompletion (Vertical blocks)
     */
    fetchBlockMetadataRequest: (draftState, action) => {
      const { blockId } = action.payload;
      if (!draftState.blocks[blockId]) {
        draftState.blocks[blockId] = {};
      }
      draftState.blocks[blockId].fetchState = 'loading';
    },
    fetchBlockMetadataSuccess: (draftState, action) => {
      const { blockId, metadata, relatedBlocksMetadata } = action.payload;
      if (!draftState.blocks[blockId]) {
        draftState.blocks[blockId] = {};
      }
      draftState.blocks[blockId] = {
        ...draftState.blocks[blockId],
        ...metadata,
        fetchState: 'loaded',
        loaded: true,
      };
      if (relatedBlocksMetadata) {
        relatedBlocksMetadata.forEach((blockMetadata) => {
          if (draftState.blocks[blockMetadata.id] === undefined) {
            draftState.blocks[blockMetadata.id] = {};
          }
          draftState.blocks[blockMetadata.id] = {
            ...draftState.blocks[blockMetadata.id],
            ...blockMetadata,
          };
        });
      }
    },
    fetchBlockMetadataFailure: (draftState, action) => {
      const { blockId } = action.payload;
      if (!draftState.blocks[blockId]) {
        draftState.blocks[blockId] = {};
      }
      draftState.blocks[blockId].fetchState = 'failure';
    },

    /**
     * updateBlock
     * This routine is responsible for CRUD operations on block properties.
     * Updates to blocks are handled in an optimistic way – applying the update
     * to the store at request time and then reverting it if the update fails.
     *
     * TODO: It may be helpful to add a flag to be optimistic or not.
     *
     * The update state of a property is added to the block in the store with
     * a dynamic property name: ${propertyToUpdate}UpdateState.
     * (e.g. bookmarkedUpdateState)
     *
     * Used in:
     *  - saveSequencePosition
     *  - addBookmark
     *  - removeBookmark
     */
    updateBlockRequest: (draftState, action) => {
      const { blockId, propertyToUpdate, updateValue } = action.payload;
      const updateStateKey = `${propertyToUpdate}UpdateState`;
      if (!draftState.blocks[blockId]) {
        draftState.blocks[blockId] = {};
      }
      draftState.blocks[blockId][updateStateKey] = 'loading';
      draftState.blocks[blockId][propertyToUpdate] = updateValue;
    },
    updateBlockSuccess: (draftState, action) => {
      const { blockId, propertyToUpdate, updateValue } = action.payload;
      const updateStateKey = `${propertyToUpdate}UpdateState`;
      if (!draftState.blocks[blockId]) {
        draftState.blocks[blockId] = {};
      }
      draftState.blocks[blockId][updateStateKey] = 'updated';
      draftState.blocks[blockId][propertyToUpdate] = updateValue;
    },
    updateBlockFailure: (draftState, action) => {
      const { blockId, propertyToUpdate, initialValue } = action.payload;
      const updateStateKey = `${propertyToUpdate}UpdateState`;
      if (!draftState.blocks[blockId]) {
        draftState.blocks[blockId] = {};
      }
      draftState.blocks[blockId][updateStateKey] = 'failed';
      draftState.blocks[blockId][propertyToUpdate] = initialValue;
    },
  },
});

export const {
  fetchCourseBlocksRequest,
  fetchCourseBlocksSuccess,
  fetchCourseBlocksFailure,
  fetchBlockMetadataRequest,
  fetchBlockMetadataSuccess,
  fetchBlockMetadataFailure,
  updateBlockRequest,
  updateBlockSuccess,
  updateBlockFailure,
} = blocksSlice.actions;

export const { reducer } = blocksSlice;

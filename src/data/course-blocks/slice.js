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

    // Handles sequence metadata updates
    // Handles completion checks
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

    // Handles bookmarking
    // TODO HANDLES UPDATES TO POSITION in an optimistic way
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

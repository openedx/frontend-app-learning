/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const SEQUENCE_LOADING = 'loading';
export const SEQUENCE_LOADED = 'loaded';
export const SEQUENCE_FAILED = 'failed';

const slice = createSlice({
  name: 'courseware',
  initialState: {
    sequenceStatus: SEQUENCE_LOADING,
    sequenceId: null,
  },
  reducers: {
    fetchSequenceRequest: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = SEQUENCE_LOADING;
    },
    fetchSequenceSuccess: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = SEQUENCE_LOADED;
    },
    fetchSequenceFailure: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = SEQUENCE_FAILED;
    },
  },
});

export const {
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
} = slice.actions;

export const {
  reducer,
} = slice;

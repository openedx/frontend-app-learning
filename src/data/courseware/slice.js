/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';

const slice = createSlice({
  name: 'courseware',
  initialState: {
    courseStatus: 'loading',
    courseUsageKey: null,
    sequenceStatus: 'loading',
    sequenceId: null,
  },
  reducers: {
    fetchCourseRequest: (state, { payload }) => {
      state.courseUsageKey = payload.courseUsageKey;
      state.courseStatus = LOADING;
    },
    fetchCourseSuccess: (state, { payload }) => {
      state.courseUsageKey = payload.courseUsageKey;
      state.courseStatus = LOADED;
    },
    fetchCourseFailure: (state, { payload }) => {
      state.courseUsageKey = payload.courseUsageKey;
      state.courseStatus = FAILED;
    },
    fetchSequenceRequest: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = LOADING;
    },
    fetchSequenceSuccess: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = LOADED;
    },
    fetchSequenceFailure: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = FAILED;
    },
  },
});

export const {
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
} = slice.actions;

export const {
  reducer,
} = slice;

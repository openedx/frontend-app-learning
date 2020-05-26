/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';
export const DENIED = 'denied';

const slice = createSlice({
  name: 'courseware',
  initialState: {
    courseStatus: 'loading',
    courseId: null,
    sequenceStatus: 'loading',
    sequenceId: null,
  },
  reducers: {
    fetchCourseRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADING;
    },
    fetchCourseSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADED;
    },
    fetchCourseFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = FAILED;
    },
    fetchCourseDenied: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = DENIED;
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
    fetchTabRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADING;
    },
    fetchTabSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADED;
    },
    fetchTabFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = FAILED;
    },
  },
});

export const {
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchCourseDenied,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
  fetchTabRequest,
  fetchTabSuccess,
  fetchTabFailure,
} = slice.actions;

export const {
  reducer,
} = slice;

/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import {
  LOADING,
  LOADED,
  FAILED,
  DENIED,
} from '@src/constants';

const slice = createSlice({
  name: 'courseware',
  initialState: {
    courseId: null,
    courseStatus: LOADING,
    sequenceId: null,
    sequenceMightBeUnit: false,
    sequenceStatus: LOADING,
    errorMessage: null,
    errorCode: null,
  },
  reducers: {
    fetchCourseRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADING;
      state.errorMessage = null;
      state.errorCode = null;
    },
    fetchCourseSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADED;
    },
    fetchCourseFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = FAILED;
      state.errorMessage = payload.errorMessage || null;
      state.errorCode = payload.errorCode || null;
    },
    fetchCourseDenied: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = DENIED;
    },
    fetchSequenceRequest: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = LOADING;
      state.sequenceMightBeUnit = false;
    },
    fetchSequenceSuccess: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = LOADED;
      state.sequenceMightBeUnit = false;
    },
    fetchSequenceFailure: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = FAILED;
      state.sequenceMightBeUnit = payload.sequenceMightBeUnit || false;
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
} = slice.actions;

export const {
  reducer,
} = slice;

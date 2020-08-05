/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';
export const DENIED = 'denied';

const slice = createSlice({
  name: 'activeCourse',
  initialState: {
    courseStatus: LOADING,
    courseId: null,
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
  },
});

export const {
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchCourseDenied,
} = slice.actions;

export const {
  reducer,
} = slice;

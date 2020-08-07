/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const COURSE_LOADING = 'loading';
export const COURSE_LOADED = 'loaded';
export const COURSE_FAILED = 'failed';
export const COURSE_DENIED = 'denied';

const slice = createSlice({
  name: 'activeCourse',
  initialState: {
    courseStatus: COURSE_LOADING,
    courseId: null,
  },
  reducers: {
    fetchCourseRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = COURSE_LOADING;
    },
    fetchCourseSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = COURSE_LOADED;
    },
    fetchCourseFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = COURSE_FAILED;
    },
    fetchCourseDenied: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = COURSE_DENIED;
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

/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';

const slice = createSlice({
  name: 'course-home',
  initialState: {
    courseStatus: 'loading',
    courseId: null,
    resetDatesToastBody: null,
    resetDatesToastHeader: null,
  },
  reducers: {
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
    setResetDatesToast: (state, { payload }) => {
      const {
        body,
        header,
      } = payload;
      state.resetDatesToastBody = body;
      state.resetDatesToastHeader = header;
    },
  },
});

export const {
  fetchTabRequest,
  fetchTabSuccess,
  fetchTabFailure,
  setResetDatesToast,
} = slice.actions;

export const {
  reducer,
} = slice;

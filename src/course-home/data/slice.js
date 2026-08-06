/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import {
  LOADING,
  LOADED,
  FAILED,
  DENIED,
} from '@src/constants';

const slice = createSlice({
  name: 'course-home',
  initialState: {
    courseStatus: 'loading',
    courseId: null,
    proctoringPanelStatus: 'loading',
    examsData: null,
    errorMessage: null,
    errorCode: null,
  },
  reducers: {
    fetchProctoringInfoResolved: (state) => {
      state.proctoringPanelStatus = LOADED;
    },
    fetchTabDenied: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = DENIED;
    },
    fetchTabFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = FAILED;
      state.errorMessage = payload.errorMessage || null;
      state.errorCode = payload.errorCode || null;
    },
    fetchTabRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADING;
      state.errorMessage = null;
      state.errorCode = null;
    },
    fetchTabSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.targetUserId = payload.targetUserId;
      state.courseStatus = LOADED;
    },
    setExamsData: (state, { payload }) => {
      state.examsData = payload;
    },
  },
});

export const {
  fetchProctoringInfoResolved,
  fetchTabDenied,
  fetchTabFailure,
  fetchTabRequest,
  fetchTabSuccess,
  setExamsData,
} = slice.actions;

export const {
  reducer,
} = slice;

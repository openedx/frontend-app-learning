/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import {
  LOADED,
  FAILED,
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
    fetchTabFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = FAILED;
      state.errorMessage = payload.errorMessage || null;
      state.errorCode = payload.errorCode || null;
    },
    setExamsData: (state, { payload }) => {
      state.examsData = payload;
    },
  },
});

export const {
  fetchProctoringInfoResolved,
  fetchTabFailure,
  setExamsData,
} = slice.actions;

export const {
  reducer,
} = slice;

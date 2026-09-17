/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADED } from '@src/constants';

const slice = createSlice({
  name: 'course-home',
  initialState: {
    courseStatus: 'loading',
    courseId: null,
    proctoringPanelStatus: 'loading',
    errorMessage: null,
    errorCode: null,
  },
  reducers: {
    fetchProctoringInfoResolved: (state) => {
      state.proctoringPanelStatus = LOADED;
    },
  },
});

export const {
  fetchProctoringInfoResolved,
} = slice.actions;

export const {
  reducer,
} = slice;

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
    toastBodyText: null,
    toastBodyLink: null,
    toastHeader: '',
    showSearch: false,
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
    },
    fetchTabRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADING;
    },
    fetchTabSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.targetUserId = payload.targetUserId;
      state.courseStatus = LOADED;
    },
    setCallToActionToast: (state, { payload }) => {
      const {
        header,
        link,
        linkText,
      } = payload;
      state.toastBodyLink = link;
      state.toastBodyText = linkText;
      state.toastHeader = header;
    },
    setShowSearch: (state, { payload }) => {
      state.showSearch = payload;
    },
  },
});

export const {
  fetchProctoringInfoResolved,
  fetchTabDenied,
  fetchTabFailure,
  fetchTabRequest,
  fetchTabSuccess,
  setCallToActionToast,
  setShowSearch,
} = slice.actions;

export const {
  reducer,
} = slice;

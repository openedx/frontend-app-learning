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
    gradesFeatureIsLocked: false,
    toastBodyText: null,
    toastBodyLink: null,
    toastHeader: '',
  },
  reducers: {
    fetchTabRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADING;
    },
    fetchTabSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.targetUserId = payload.targetUserId;
      state.courseStatus = LOADED;
    },
    fetchTabFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = FAILED;
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
    setGradesFeatureStatus: (state, { payload }) => {
      state.gradesFeatureIsLocked = payload.gradesFeatureIsLocked;
    },
  },
});

export const {
  fetchTabRequest,
  fetchTabSuccess,
  fetchTabFailure,
  setCallToActionToast,
  setGradesFeatureStatus,
} = slice.actions;

export const {
  reducer,
} = slice;

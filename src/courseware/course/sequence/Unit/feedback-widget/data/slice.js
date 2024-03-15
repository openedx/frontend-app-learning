/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';
export const UNSET = 'unset';

const slice = createSlice({
  courseId: null,
  name: 'wholeCourseTranslationFeedback',
  initialState: {
    fetchWholeCourseTranslationFeedbackStatus: UNSET,
    createWholeCourseTranslationFeedbackStatus: UNSET,
  },
  reducers: {
    fetchWholeCourseTranslationFeedbackRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.fetchWholeCourseTranslationFeedbackStatus = LOADING;
    },
    fetchWholeCourseTranslationFeedbackSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.fetchWholeCourseTranslationFeedbackStatus = LOADED;
    },
    fetchWholeCourseTranslationFeedbackFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.fetchWholeCourseTranslationFeedbackStatus = FAILED;
    },
    createWholeCourseTranslationFeedbackRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.createWholeCourseTranslationFeedbackStatus = LOADING;
    },
    createWholeCourseTranslationFeedbackSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.createWholeCourseTranslationFeedbackStatus = LOADED;
    },
    createWholeCourseTranslationFeedbackFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.createWholeCourseTranslationFeedbackStatus = FAILED;
    },
  },
});

export const {
  createWholeCourseTranslationFeedbackRequest,
  createWholeCourseTranslationFeedbackSuccess,
  createWholeCourseTranslationFeedbackFailure,
  fetchWholeCourseTranslationFeedbackRequest,
  fetchWholeCourseTranslationFeedbackSuccess,
  fetchWholeCourseTranslationFeedbackFailure,
} = slice.actions;

export const {
  reducer,
} = slice;

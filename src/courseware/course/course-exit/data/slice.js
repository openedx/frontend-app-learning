/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import {
  LOADING,
  LOADED,
  FAILED,
} from '@src/constants';

const slice = createSlice({
  courseId: null,
  name: 'recommendations',
  initialState: {
    recommendationsStatus: LOADING,
  },
  reducers: {
    fetchCourseRecommendationsRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.recommendationsStatus = LOADING;
    },
    fetchCourseRecommendationsSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.recommendationsStatus = LOADED;
    },
    fetchCourseRecommendationsFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.recommendationsStatus = FAILED;
    },
  },
});

export const {
  fetchCourseRecommendationsRequest,
  fetchCourseRecommendationsSuccess,
  fetchCourseRecommendationsFailure,
} = slice.actions;

export const {
  reducer,
} = slice;

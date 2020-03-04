/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const courseMetaSlice = createSlice({
  name: 'course-meta',
  initialState: {
    fetchState: null,
  },
  reducers: {
    fetchCourseMetadataRequest: (draftState) => {
      draftState.fetchState = 'loading';
    },
    fetchCourseMetadataSuccess: (draftState, { payload }) => ({
      fetchState: 'loaded',
      name: payload.name,
      number: payload.number,
      org: payload.org,
      tabs: payload.tabs,
      userHasAccess: payload.userHasAccess,
      enrollmentIsActive: payload.enrollment.isActive,
      verifiedMode: payload.verifiedMode,
    }),
    fetchCourseMetadataFailure: (draftState) => {
      draftState.fetchState = 'failed';
    },
  },
});

export const {
  fetchCourseMetadataRequest,
  fetchCourseMetadataSuccess,
  fetchCourseMetadataFailure,
} = courseMetaSlice.actions;

export const { reducer } = courseMetaSlice;

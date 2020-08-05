/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';

const slice = createSlice({
  name: 'course-home',
  initialState: {
    displayResetDatesToast: false,
  },
  reducers: {
    toggleResetDatesToast: (state, { payload }) => {
      state.displayResetDatesToast = payload.displayResetDatesToast;
    },
  },
});

export const {
  toggleResetDatesToast,
} = slice.actions;

export const {
  reducer,
} = slice;

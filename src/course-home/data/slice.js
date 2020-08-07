/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

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

/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'plugin',
  initialState: {
  },
  reducers: {
    registerOverrideMethod: (state, { payload }) => {
      const { pluginName, methodName, method } = payload;
      state[pluginName] = state[pluginName] || {};
      state[pluginName][methodName] = method;
    },
  },
});

export const {
  registerOverrideMethod,
} = slice.actions;

export const { reducer } = slice;

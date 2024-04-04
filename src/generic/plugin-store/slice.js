/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

function add(state, modelType, model, idField, nameField) {
  idField = idField ?? 'id';
  const id = nameField || model[idField];
  if (state[modelType] === undefined) {
    state[modelType] = {};
  }
  state[modelType][id] = model;
}

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
    addModelPlugin: (state, { payload }) => {
      const {
        modelType, model, idField, nameField,
      } = payload;
      add(state, modelType, model, idField, nameField);
    },
  },
});

export const {
  registerOverrideMethod,
  addModelPlugin,
} = slice.actions;

export const { reducer } = slice;

/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

function add(state, modelType, model, idField) {
  idField = idField ?? 'id';
  const id = model[idField];
  if (state[modelType] === undefined) {
    state[modelType] = {};
  }
  state[modelType][id] = model;
}

function update(state, modelType, model, idField) {
  idField = idField ?? 'id';
  const id = model[idField];
  if (state[modelType] === undefined) {
    state[modelType] = {};
  }
  state[modelType][id] = { ...state[modelType][id], ...model };
}

function remove(state, modelType, id) {
  if (state[modelType] === undefined) {
    state[modelType] = {};
  }

  delete state[modelType][id];
}

const slice = createSlice({
  name: 'models',
  initialState: {},
  reducers: {
    addModel: (state, { payload }) => {
      const { modelType, model, idField } = payload;
      add(state, modelType, model, idField);
    },
    addModels: (state, { payload }) => {
      const { modelType, models, idField } = payload;
      models.forEach(model => add(state, modelType, model, idField));
    },
    addModelsMap: (state, { payload }) => {
      const { modelType, modelsMap, idField } = payload;
      Object.values(modelsMap).forEach(model => add(state, modelType, model, idField));
    },
    updateModel: (state, { payload }) => {
      const { modelType, model, idField } = payload;
      update(state, modelType, model, idField);
    },
    updateModels: (state, { payload }) => {
      const { modelType, models, idField } = payload;
      models.forEach(model => update(state, modelType, model, idField));
    },
    updateModelsMap: (state, { payload }) => {
      const { modelType, modelsMap, idField } = payload;
      Object.values(modelsMap).forEach(model => update(state, modelType, model, idField));
    },
    removeModel: (state, { payload }) => {
      const { modelType, id } = payload;
      remove(state, modelType, id);
    },
    removeModels: (state, { payload }) => {
      const { modelType, ids } = payload;
      ids.forEach(id => remove(state, modelType, id));
    },
  },
});

export const {
  addModel,
  addModels,
  addModelsMap,
  updateModel,
  updateModels,
  updateModelsMap,
  removeModel,
  removeModels,
} = slice.actions;

export const { reducer } = slice;

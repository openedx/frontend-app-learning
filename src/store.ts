import { reducer as specialExamsReducer } from '@edx/frontend-lib-special-exams';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as modelsReducer } from './generic/model-store';

export default function initializeStore() {
  return configureStore({
    reducer: {
      models: modelsReducer,
      specialExams: specialExamsReducer,
    },
  });
}

export const store = initializeStore();

export type RootState = ReturnType<typeof store.getState>;

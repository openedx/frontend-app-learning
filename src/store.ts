import { reducer as specialExamsReducer } from '@edx/frontend-lib-special-exams';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as modelsReducer } from './generic/model-store';
import { reducer as pluginsReducer } from './generic/plugin-store';

export default function initializeStore() {
  return configureStore({
    reducer: {
      models: modelsReducer,
      specialExams: specialExamsReducer,
      plugins: pluginsReducer,
    },
    // temporarily solutions to disable serializable check for plugin actions
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['plugin/registerOverrideMethod'],
        ignoredPaths: ['plugins'],
      },
    }),
  });
}

export const store = initializeStore();

export type RootState = ReturnType<typeof store.getState>;

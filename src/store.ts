import { reducer as specialExamsReducer } from '@edx/frontend-lib-special-exams';
import { configureStore } from '@reduxjs/toolkit';

export default function initializeStore() {
  return configureStore({
    reducer: {
      specialExams: specialExamsReducer,
    },
  });
}

export const store = initializeStore();

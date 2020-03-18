import { configureStore } from '@reduxjs/toolkit';
import { reducer as coursewareReducer } from './data/courseware';
import { reducer as modelsReducer } from './data/model-store';

const store = configureStore({
  reducer: {
    models: modelsReducer,
    courseware: coursewareReducer,
  },
});

export default store;

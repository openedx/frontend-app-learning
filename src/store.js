import { configureStore } from '@reduxjs/toolkit';
import { reducer as courseReducer } from './data/course-meta/slice';
import { reducer as courseBlocksReducer } from './data/course-blocks/slice';

const store = configureStore({
  reducer: {
    courseMeta: courseReducer,
    courseBlocks: courseBlocksReducer,
  },
});

export default store;

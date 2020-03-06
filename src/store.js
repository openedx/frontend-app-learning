import { configureStore } from '@reduxjs/toolkit';
import { reducer as courseReducer } from './data/course-meta';
import { reducer as courseBlocksReducer } from './data/course-blocks';

const store = configureStore({
  reducer: {
    courseMeta: courseReducer,
    courseBlocks: courseBlocksReducer,
  },
});

export default store;

import { configureStore } from '@reduxjs/toolkit';

import { reducer as activeCourseReducer } from './course';
import { reducer as courseHomeReducer } from './course-home';
import { reducer as coursewareReducer } from './courseware';
import { reducer as modelsReducer } from './generic/model-store';

export default function initializeStore() {
  return configureStore({
    reducer: {
      activeCourse: activeCourseReducer,
      courseHome: courseHomeReducer,
      courseware: coursewareReducer,
      models: modelsReducer,
    },
  });
}

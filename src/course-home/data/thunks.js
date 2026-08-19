import { logError } from '@edx/frontend-platform/logging';
import {
  getExamsData,
  deprecatedPostCourseGoals,
} from './api';

import {
  setExamsData,
} from './slice';

export const eventTypes = {
  POST_EVENT: 'post_event',
};

export async function deprecatedSaveCourseGoal(courseId, goalKey) {
  return deprecatedPostCourseGoals(courseId, goalKey);
}

export function fetchExamAttemptsData(courseId, sequenceIds) {
  return async (dispatch) => {
    const results = await Promise.all(sequenceIds.map(async (sequenceId) => {
      try {
        const response = await getExamsData(courseId, sequenceId);
        return response.exam || {};
      } catch (e) {
        logError(e);
        return {};
      }
    }));

    dispatch(setExamsData(results));
  };
}

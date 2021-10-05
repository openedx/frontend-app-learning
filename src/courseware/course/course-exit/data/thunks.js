import { logError } from '@edx/frontend-platform/logging';

import {
  fetchCourseRecommendationsFailure,
  fetchCourseRecommendationsRequest,
  fetchCourseRecommendationsSuccess,
} from './slice';
import {
  getCourseRecommendations,
  postUnsubscribeFromGoalReminders,
} from './api';
import { updateModel } from '../../../../generic/model-store';

export default function fetchCourseRecommendations(courseKey, courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseRecommendationsRequest({ courseId }));
    try {
      const recommendations = await getCourseRecommendations(courseKey);
      dispatch(updateModel({
        modelType: 'coursewareMeta',
        model: {
          id: courseId,
          recommendations,
        },
      }));
      dispatch(fetchCourseRecommendationsSuccess({ courseId }));
    } catch (error) {
      logError(error);
      dispatch(fetchCourseRecommendationsFailure({ courseId }));
    }
  };
}

export async function unsubscribeFromGoalReminders(courseId, daysPerWeek, subscribedToReminders) {
  return postUnsubscribeFromGoalReminders(courseId, daysPerWeek, subscribedToReminders);
}

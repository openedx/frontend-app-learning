import { logError } from '@edx/frontend-platform/logging';
import {
  getCourseHomeCourseMetadata,
  getDatesTabData,
  getExamsData,
  getOutlineTabData,
  getProgressTabData,
  deprecatedPostCourseGoals,
  postWeeklyLearningGoal,
  postDismissWelcomeMessage,
  postRequestCert,
  getLiveTabIframe,
} from './api';

import {
  addModel,
} from '../../generic/model-store';

import {
  fetchTabDenied,
  fetchTabFailure,
  fetchTabRequest,
  fetchTabSuccess,
  setExamsData,
} from './slice';

export const eventTypes = {
  POST_EVENT: 'post_event',
};

export function fetchTab(courseId, tab, getTabData, targetUserId) {
  return async (dispatch) => {
    dispatch(fetchTabRequest({ courseId }));
    try {
      const promisesToFulfill = [getCourseHomeCourseMetadata(courseId, 'outline')];
      if (getTabData) {
        promisesToFulfill.push(getTabData(courseId, targetUserId));
      }
      const [
        courseHomeCourseMetadataResult,
        tabDataResult,
      ] = await Promise.allSettled(promisesToFulfill);
      if (courseHomeCourseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'courseHomeMeta',
          model: {
            id: courseId,
            ...courseHomeCourseMetadataResult.value,
          },
        }));
      }
      if (tabDataResult?.status === 'fulfilled') {
        dispatch(addModel({
          modelType: tab,
          model: {
            id: courseId,
            ...tabDataResult.value,
          },
        }));
      }
      if (courseHomeCourseMetadataResult.status === 'rejected') {
        throw courseHomeCourseMetadataResult.reason;
      } else if (!courseHomeCourseMetadataResult.value.courseAccess.hasAccess) {
        // If the learner does not have access to the course, short cut to dispatch to a denied response regardless of
        // the tabDataResult.
        dispatch(fetchTabDenied({ courseId }));
      } else if (tabDataResult?.status === 'rejected') {
        throw tabDataResult.reason;
      } else {
        dispatch(fetchTabSuccess({
          courseId,
          targetUserId,
        }));
      }
    } catch (e) {
      // Extract error details from 403 responses
      let errorMessage = null;
      let errorCode = null;
      if (e?.response?.status === 403 && e?.response?.data) {
        errorMessage = e.response.data.detail || null;
        errorCode = e.response.data.error_code || null;
      }
      dispatch(fetchTabFailure({ courseId, errorMessage, errorCode }));
      logError(e);
    }
  };
}

export function fetchDatesTab(courseId) {
  return fetchTab(courseId, 'dates', getDatesTabData);
}

export function fetchProgressTab(courseId, targetUserId) {
  return fetchTab(courseId, 'progress', getProgressTabData, parseInt(targetUserId, 10) || targetUserId);
}

export function fetchOutlineTab(courseId) {
  return fetchTab(courseId, 'outline', getOutlineTabData);
}

export function fetchLiveTab(courseId) {
  return fetchTab(courseId, 'live', getLiveTabIframe);
}

export function fetchDiscussionTab(courseId) {
  return fetchTab(courseId, 'discussion');
}

export function dismissWelcomeMessage(courseId) {
  return async () => postDismissWelcomeMessage(courseId);
}

export function requestCert(courseId) {
  return async () => postRequestCert(courseId);
}

export async function deprecatedSaveCourseGoal(courseId, goalKey) {
  return deprecatedPostCourseGoals(courseId, goalKey);
}

export async function saveWeeklyLearningGoal(courseId, daysPerWeek, subscribedToReminders) {
  return postWeeklyLearningGoal(courseId, daysPerWeek, subscribedToReminders);
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

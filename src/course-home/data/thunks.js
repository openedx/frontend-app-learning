import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import {
  executePostFromPostEvent,
  getCourseHomeCourseMetadata,
  getDatesTabData,
  getExamsData,
  getOutlineTabData,
  getProgressTabData,
  postCourseDeadlines,
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
  setCallToActionToast,
  setExamsData,
} from './slice';

const eventTypes = {
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

export function resetDeadlines(courseId, model, getTabData) {
  return async (dispatch) => {
    postCourseDeadlines(courseId, model).then(response => {
      const { data } = response;
      const {
        header,
        link,
        link_text: linkText,
      } = data;
      dispatch(getTabData(courseId));
      dispatch(setCallToActionToast({ header, link, linkText }));
    });
  };
}

export async function deprecatedSaveCourseGoal(courseId, goalKey) {
  return deprecatedPostCourseGoals(courseId, goalKey);
}

export async function saveWeeklyLearningGoal(courseId, daysPerWeek, subscribedToReminders) {
  return postWeeklyLearningGoal(courseId, daysPerWeek, subscribedToReminders);
}

export function processEvent(eventData, getTabData) {
  return async (dispatch) => {
    // Pulling this out early so the data doesn't get camelCased and is easier
    // to use when it's passed to the backend
    const { research_event_data: researchEventData } = eventData;
    const event = camelCaseObject(eventData);
    if (event.eventName === eventTypes.POST_EVENT) {
      executePostFromPostEvent(event.postData, researchEventData).then(response => {
        const { data } = response;
        const {
          header,
          link,
          link_text: linkText,
        } = data;
        dispatch(getTabData(event.postData.bodyParams.courseId));
        dispatch(setCallToActionToast({ header, link, linkText }));
      });
    }
  };
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

import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import {
  executePostFromPostEvent,
  getCourseHomeCourseMetadata,
  getDatesTabData,
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
} from './slice';

const eventTypes = {
  POST_EVENT: 'post_event',
};

export function fetchTab(courseId, tab, getTabData, targetUserId) {
  return async (dispatch) => {
    dispatch(fetchTabRequest({ courseId }));
    try {
      const courseHomeCourseMetadata = await getCourseHomeCourseMetadata(courseId, 'outline');
      dispatch(addModel({
        modelType: 'courseHomeMeta',
        model: {
          id: courseId,
          ...courseHomeCourseMetadata,
        },
      }));
      const tabDataResult = getTabData && await getTabData(courseId, targetUserId);
      if (tabDataResult) {
        dispatch(addModel({
          modelType: tab,
          model: {
            id: courseId,
            ...tabDataResult,
          },
        }));
      }
      // Disable the access-denied path for now - it caused a regression
      if (!courseHomeCourseMetadata.courseAccess.hasAccess) {
        dispatch(fetchTabDenied({ courseId }));
      } else if (tabDataResult || !getTabData) {
        dispatch(fetchTabSuccess({
          courseId,
          targetUserId,
        }));
      }
    } catch (e) {
      dispatch(fetchTabFailure({ courseId }));
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

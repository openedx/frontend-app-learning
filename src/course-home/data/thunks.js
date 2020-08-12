import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import {
  executePostFromPostEvent,
  getCourseHomeCourseMetadata,
  getDatesTabData,
  getOutlineTabData,
  getProgressTabData,
  postCourseDeadlines,
  postDismissWelcomeMessage,
  postRequestCert,
} from './api';

import {
  addModel,
} from '../../generic/model-store';

import {
  fetchTabFailure,
  fetchTabRequest,
  fetchTabSuccess,
  setResetDatesToast,
} from './slice';

const eventTypes = {
  POST_EVENT: 'post_event',
};

export function fetchTab(courseId, tab, getTabData) {
  return async (dispatch) => {
    dispatch(fetchTabRequest({ courseId }));
    Promise.allSettled([
      getCourseHomeCourseMetadata(courseId),
      getTabData(courseId),
    ]).then(([courseHomeCourseMetadataResult, tabDataResult]) => {
      const fetchedCourseHomeCourseMetadata = courseHomeCourseMetadataResult.status === 'fulfilled';
      const fetchedTabData = tabDataResult.status === 'fulfilled';

      if (fetchedCourseHomeCourseMetadata) {
        dispatch(addModel({
          modelType: 'courses',
          model: {
            id: courseId,
            ...courseHomeCourseMetadataResult.value,
          },
        }));
      } else {
        logError(courseHomeCourseMetadataResult.reason);
      }

      if (fetchedTabData) {
        dispatch(addModel({
          modelType: tab,
          model: {
            id: courseId,
            ...tabDataResult.value,
          },
        }));
      } else {
        logError(tabDataResult.reason);
      }

      if (fetchedCourseHomeCourseMetadata && fetchedTabData) {
        dispatch(fetchTabSuccess({ courseId }));
      } else {
        dispatch(fetchTabFailure({ courseId }));
      }
    });
  };
}

export function fetchDatesTab(courseId) {
  return fetchTab(courseId, 'dates', getDatesTabData);
}

export function fetchProgressTab(courseId) {
  return fetchTab(courseId, 'progress', getProgressTabData);
}

export function fetchOutlineTab(courseId) {
  return fetchTab(courseId, 'outline', getOutlineTabData);
}

export function resetDeadlines(courseId, getTabData) {
  return async (dispatch) => {
    postCourseDeadlines(courseId).then(response => {
      const { data } = response;
      const {
        body,
        header,
      } = data;
      dispatch(getTabData(courseId));
      dispatch(setResetDatesToast({ body, header }));
    });
  };
}

export function dismissWelcomeMessage(courseId) {
  return async () => postDismissWelcomeMessage(courseId);
}

export function requestCert(courseId) {
  return async () => postRequestCert(courseId);
}

export function processEvent(eventData, getTabData) {
  return async (dispatch) => {
    const event = camelCaseObject(eventData);
    if (event.eventName === eventTypes.POST_EVENT) {
      executePostFromPostEvent(event.postData).then(response => {
        const { data } = response;
        const {
          body,
          header,
        } = data;
        dispatch(getTabData(event.postData.bodyParams.courseId));
        dispatch(setResetDatesToast({ body, header }));
      });
    }
  };
}

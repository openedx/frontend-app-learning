import { logError } from '@edx/frontend-platform/logging';
import {
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
  toggleResetDatesToast,
} from './slice';

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
    postCourseDeadlines(courseId).then(() => {
      dispatch(getTabData(courseId));
      dispatch(toggleResetDatesToast({ displayResetDatesToast: true }));
    });
  };
}

export function dismissWelcomeMessage(courseId) {
  return async () => postDismissWelcomeMessage(courseId);
}

export function requestCert(courseId) {
  return async () => postRequestCert(courseId);
}

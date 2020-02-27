/* eslint-disable import/prefer-default-export */
import { getConfig } from '@edx/frontend-platform';
import {
  fetchCourseMetadataRequest,
  fetchCourseMetadataSuccess,
  fetchCourseMetadataFailure,
} from './slice';
import {
  getCourseMetadata,
} from './api';

export function fetchCourseMetadata(courseUsageKey) {
  return async (dispatch) => {
    dispatch(fetchCourseMetadataRequest({ courseUsageKey }));
    try {
      const courseMetadata = await getCourseMetadata(courseUsageKey);

      if (!courseMetadata.userHasAccess) {
        global.location.assign(`${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/course/`);
      } else {
        dispatch(fetchCourseMetadataSuccess(courseMetadata));
      }
    } catch (error) {
      dispatch(fetchCourseMetadataFailure(error));
    }
  };
}

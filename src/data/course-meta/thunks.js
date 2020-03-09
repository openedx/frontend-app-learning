/* eslint-disable import/prefer-default-export */
import { logError } from '@edx/frontend-platform/logging';
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
      dispatch(fetchCourseMetadataSuccess(courseMetadata));
    } catch (error) {
      logError(error);
      dispatch(fetchCourseMetadataFailure({ courseUsageKey }));
    }
  };
}

/* eslint-disable import/prefer-default-export */
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
      dispatch(fetchCourseMetadataFailure(error));
    }
  };
}

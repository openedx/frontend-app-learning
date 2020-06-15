import { logError } from '@edx/frontend-platform/logging';
import {
  getCourseMetadata,
  getCourseBlocks,
  getSequenceMetadata,
  getDatesTabData,
  getOutlineTabData,
} from './api';
import {
  addModelsMap, updateModel, updateModels, updateModelsMap, addModel,
} from '../model-store';
import {
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchCourseDenied,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
  fetchTabRequest,
  fetchTabSuccess,
  fetchTabFailure,
} from './slice';

export function fetchCourse(courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseRequest({ courseId }));
    Promise.allSettled([
      getCourseMetadata(courseId),
      getCourseBlocks(courseId),
    ]).then(([courseMetadataResult, courseBlocksResult]) => {
      if (courseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'courses',
          model: courseMetadataResult.value,
        }));
      }

      if (courseBlocksResult.status === 'fulfilled') {
        const {
          courses, sections, sequences, units,
        } = courseBlocksResult.value;

        // This updates the course with a sectionIds array from the blocks data.
        dispatch(updateModelsMap({
          modelType: 'courses',
          modelsMap: courses,
        }));
        dispatch(addModelsMap({
          modelType: 'sections',
          modelsMap: sections,
        }));
        // We update for sequences and units because the sequence metadata may have come back first.
        dispatch(updateModelsMap({
          modelType: 'sequences',
          modelsMap: sequences,
        }));
        dispatch(updateModelsMap({
          modelType: 'units',
          modelsMap: units,
        }));
      }

      const fetchedMetadata = courseMetadataResult.status === 'fulfilled';
      const fetchedBlocks = courseBlocksResult.status === 'fulfilled';

      // Log errors for each request if needed. Course block failures may occur
      // even if the course metadata request is successful
      if (!fetchedBlocks) {
        logError(courseBlocksResult.reason);
      }
      if (!fetchedMetadata) {
        logError(courseMetadataResult.reason);
      }

      if (fetchedMetadata) {
        if (courseMetadataResult.value.canLoadCourseware.hasAccess && fetchedBlocks) {
          // User has access
          dispatch(fetchCourseSuccess({ courseId }));
          return;
        }
        // User either doesn't have access or only has partial access
        // (can't access course blocks)
        dispatch(fetchCourseDenied({ courseId }));
        return;
      }

      // Definitely an error happening
      dispatch(fetchCourseFailure({ courseId }));
    });
  };
}

export function fetchTab(courseId, tab, version, getTabData) {
  return async (dispatch) => {
    dispatch(fetchTabRequest({ courseId }));
    Promise.allSettled([
      getCourseMetadata(courseId),
      getTabData(courseId, version),
    ]).then(([courseMetadataResult, tabDataResult]) => {
      const fetchedMetadata = courseMetadataResult.status === 'fulfilled';
      const fetchedTabData = tabDataResult.status === 'fulfilled';

      if (fetchedMetadata) {
        /*
         * NOTE: The "courses" models created by this thunk do not include an array of sectionIds.
         * If that data is required for some use case, then fetchTab will need to call
         * getCourseBlocks as well.  See fetchCourse above.
         */
        dispatch(addModel({
          modelType: 'courses',
          model: courseMetadataResult.value,
        }));
      } else {
        logError(courseMetadataResult.reason);
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

      if (fetchedMetadata && fetchedTabData) {
        dispatch(fetchTabSuccess({ courseId }));
      } else {
        dispatch(fetchTabFailure({ courseId }));
      }
    });
  };
}

export function fetchDatesTab(courseId) {
  return fetchTab(courseId, 'dates', 'v1', getDatesTabData);
}

export function fetchOutlineTab(courseId) {
  return fetchTab(courseId, 'outline', 'v1', getOutlineTabData);
}

export function fetchSequence(sequenceId) {
  return async (dispatch) => {
    dispatch(fetchSequenceRequest({ sequenceId }));
    try {
      const { sequence, units } = await getSequenceMetadata(sequenceId);
      dispatch(updateModel({
        modelType: 'sequences',
        model: sequence,
      }));
      dispatch(updateModels({
        modelType: 'units',
        models: units,
      }));
      dispatch(fetchSequenceSuccess({ sequenceId }));
    } catch (error) {
      logError(error);
      dispatch(fetchSequenceFailure({ sequenceId }));
    }
  };
}

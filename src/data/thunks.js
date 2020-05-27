import { logError } from '@edx/frontend-platform/logging';
import {
  getCourseMetadata,
  getCourseBlocks,
  getSequenceMetadata,
  getTabData,
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
      getOutlineTabData(courseId),
    ]).then(([courseMetadataResult, courseBlocksResult, outlineTabResult]) => {
      if (courseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'courses',
          model: courseMetadataResult.value,
        }));
        dispatch(addModel({
          modelType: 'courseInfo',
          model: {
            id: courseMetadataResult.value.id,
            isStaff: courseMetadataResult.value.isStaff,
            number: courseMetadataResult.value.number,
            org: courseMetadataResult.value.org,
            tabs: courseMetadataResult.value.tabs,
            title: courseMetadataResult.value.title,
          },
        }));
      }

      if (courseBlocksResult.status === 'fulfilled') {
        const {
          courses, sections, sequences, units,
        } = courseBlocksResult.value;

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

      if (outlineTabResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'outline',
          model: outlineTabResult.value,
        }));
      }

      const fetchedMetadata = courseMetadataResult.status === 'fulfilled';
      const fetchedBlocks = courseBlocksResult.status === 'fulfilled';
      const fetchedOutline = outlineTabResult.status === 'fulfilled';

      // Log errors for each request if needed. Course block failures may occur
      // even if the course metadata request is successful
      if (!fetchedBlocks) {
        logError(courseBlocksResult.reason);
      }
      if (!fetchedMetadata) {
        logError(courseMetadataResult.reason);
      }
      if (!fetchedOutline) {
        logError(outlineTabResult.reason);
      }

      if (fetchedMetadata) {
        if (courseMetadataResult.value.canLoadCourseware.hasAccess && fetchedBlocks && fetchedOutline) {
          // User has access
          dispatch(fetchCourseSuccess({ courseId }));
          return;
        }
        // User either doesn't have access or only has partial access
        // (can't access course blocks or course outline)
        dispatch(fetchCourseDenied({ courseId }));
        return;
      }

      // Definitely an error happening
      dispatch(fetchCourseFailure({ courseId }));
    });
  };
}

export function fetchTab(courseId, tab, version) {
  return async (dispatch) => {
    dispatch(fetchTabRequest({ courseId }));
    Promise.allSettled([
      getCourseMetadata(courseId),
      getTabData(courseId, tab, version),
    ]).then(([courseMetadataResult, tabDataResult]) => {
      const fetchedMetadata = courseMetadataResult.status === 'fulfilled';
      const fetchedTabData = tabDataResult.status === 'fulfilled';

      if (fetchedMetadata) {
        dispatch(addModel({
          modelType: 'courseInfo',
          model: {
            id: courseMetadataResult.value.id,
            isStaff: courseMetadataResult.value.isStaff,
            number: courseMetadataResult.value.number,
            org: courseMetadataResult.value.org,
            tabs: courseMetadataResult.value.tabs,
            title: courseMetadataResult.value.title,
          },
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
  return fetchTab(courseId, 'dates', 'v1');
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

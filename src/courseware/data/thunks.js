import { logError, logInfo } from '@edx/frontend-platform/logging';
import { getCourseHomeCourseMetadata } from '../../course-home/data/api';
import {
  addModel, addModelsMap, updateModel, updateModels, updateModelsMap,
} from '../../generic/model-store';
import {
  getBlockCompletion,
  getCourseDiscussionConfig,
  getCourseMetadata,
  getCourseTopics,
  getLearningSequencesOutline,
  getSequenceMetadata,
  postIntegritySignature,
  postSequencePosition,
} from './api';
import {
  fetchCourseDenied,
  fetchCourseFailure,
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchSequenceFailure,
  fetchSequenceRequest,
  fetchSequenceSuccess,
} from './slice';

export function fetchCourse(courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseRequest({ courseId }));
    Promise.allSettled([
      getCourseMetadata(courseId),
      getLearningSequencesOutline(courseId),
      getCourseHomeCourseMetadata(courseId, 'courseware'),
    ]).then(([
      courseMetadataResult,
      learningSequencesOutlineResult,
      courseHomeMetadataResult]) => {
      if (courseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'coursewareMeta',
          model: courseMetadataResult.value,
        }));
      }

      if (courseHomeMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'courseHomeMeta',
          model: {
            id: courseId,
            ...courseHomeMetadataResult.value,
          },
        }));
      }

      if (learningSequencesOutlineResult.status === 'fulfilled') {
        const {
          courses, sections, sequences,
        } = learningSequencesOutlineResult.value;

        // This updates the course with a sectionIds array from the Learning Sequence data.
        dispatch(updateModelsMap({
          modelType: 'coursewareMeta',
          modelsMap: courses,
        }));
        dispatch(addModelsMap({
          modelType: 'sections',
          modelsMap: sections,
        }));
        // We update for sequences because the sequence metadata may have come back first.
        dispatch(updateModelsMap({
          modelType: 'sequences',
          modelsMap: sequences,
        }));
      }

      const fetchedMetadata = courseMetadataResult.status === 'fulfilled';
      const fetchedCourseHomeMetadata = courseHomeMetadataResult.status === 'fulfilled';
      const fetchedOutline = learningSequencesOutlineResult.status === 'fulfilled';

      // Log errors for each request if needed. Outline failures may occur
      // even if the course metadata request is successful
      if (!fetchedOutline) {
        const { response } = learningSequencesOutlineResult.reason;
        if (response && response.status === 403) {
          // 403 responses are normal - they happen when the learner is logged out.
          // We'll redirect them in a moment to the outline tab by calling fetchCourseDenied() below.
          logInfo(learningSequencesOutlineResult.reason);
        } else {
          logError(learningSequencesOutlineResult.reason);
        }
      }
      if (!fetchedMetadata) {
        logError(courseMetadataResult.reason);
      }
      if (!fetchedCourseHomeMetadata) {
        logError(courseHomeMetadataResult.reason);
      }
      if (fetchedMetadata && fetchedCourseHomeMetadata) {
        if (courseHomeMetadataResult.value.courseAccess.hasAccess
          && courseHomeMetadataResult.value.canLoadCourseware
          && fetchedOutline) {
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

export function fetchSequence(sequenceId) {
  return async (dispatch) => {
    dispatch(fetchSequenceRequest({ sequenceId }));
    try {
      const { sequence, units } = await getSequenceMetadata(sequenceId);
      if (sequence.blockType !== 'sequential') {
        // Some other block types (particularly 'chapter') can be returned
        // by this API. We want to error in that case, since downstream
        // courseware code is written to render Sequences of Units.
        logError(
          `Requested sequence '${sequenceId}' `
          + `has block type '${sequence.blockType}'; expected block type 'sequential'.`,
        );
        dispatch(fetchSequenceFailure({ sequenceId }));
      } else {
        dispatch(updateModel({
          modelType: 'sequences',
          model: sequence,
        }));
        dispatch(updateModels({
          modelType: 'units',
          models: units,
        }));
        dispatch(fetchSequenceSuccess({ sequenceId }));
      }
    } catch (error) {
      // Some errors are expected - for example, CoursewareContainer may request sequence metadata for a unit and rely
      // on the request failing to notice that it actually does have a unit (mostly so it doesn't have to know anything
      // about the opaque key structure). In such cases, the backend gives us a 422.
      const sequenceMightBeUnit = error?.response?.status === 422;
      if (!sequenceMightBeUnit) {
        logError(error);
      }
      dispatch(fetchSequenceFailure({ sequenceId, sequenceMightBeUnit }));
    }
  };
}

export function checkBlockCompletion(courseId, sequenceId, unitId) {
  return async (dispatch, getState) => {
    const { models } = getState();
    if (models.units[unitId].complete) {
      return {}; // do nothing. Things don't get uncompleted after they are completed.
    }

    try {
      const isComplete = await getBlockCompletion(courseId, sequenceId, unitId);
      dispatch(updateModel({
        modelType: 'units',
        model: {
          id: unitId,
          complete: isComplete,
        },
      }));
      return isComplete;
    } catch (error) {
      logError(error);
    }
    return {};
  };
}

export function saveSequencePosition(courseId, sequenceId, activeUnitIndex) {
  return async (dispatch, getState) => {
    const { models } = getState();
    const initialActiveUnitIndex = models.sequences[sequenceId].activeUnitIndex;
    // Optimistically update the position.
    dispatch(updateModel({
      modelType: 'sequences',
      model: {
        id: sequenceId,
        activeUnitIndex,
      },
    }));
    try {
      await postSequencePosition(courseId, sequenceId, activeUnitIndex);
      // Update again under the assumption that the above call succeeded, since it doesn't return a
      // meaningful response.
      dispatch(updateModel({
        modelType: 'sequences',
        model: {
          id: sequenceId,
          activeUnitIndex,
        },
      }));
    } catch (error) {
      logError(error);
      dispatch(updateModel({
        modelType: 'sequences',
        model: {
          id: sequenceId,
          activeUnitIndex: initialActiveUnitIndex,
        },
      }));
    }
  };
}

export function saveIntegritySignature(courseId, isMasquerading) {
  return async (dispatch) => {
    try {
      // If the request is made by a staff user masquerading as a specific learner,
      // don't actually create a signature for them on the backend,
      // only the modal dialog will be dismissed
      if (!isMasquerading) {
        await postIntegritySignature(courseId);
      }
      dispatch(updateModel({
        modelType: 'coursewareMeta',
        model: {
          id: courseId,
          userNeedsIntegritySignature: false,
        },
      }));
    } catch (error) {
      logError(error);
    }
  };
}

export function getCourseDiscussionTopics(courseId) {
  return async (dispatch) => {
    try {
      const config = await getCourseDiscussionConfig(courseId);
      // Only load topics for the openedx provider, the legacy provider uses
      // the xblock
      if (config.provider === 'openedx') {
        const topics = await getCourseTopics(courseId);
        dispatch(updateModels({
          modelType: 'discussionTopics',
          models: topics,
          idField: 'usageKey',
        }));
      }
    } catch (error) {
      logError(error);
    }
  };
}

import { logError } from '@edx/frontend-platform/logging';
import {
  getBlockCompletion,
  postSequencePosition,
  getCourseMetadata,
  getCourseBlocks,
  getLearningSequencesOutline,
  getSequenceMetadata,
  postIntegritySignature,
} from './api';
import {
  updateModel, addModel, addModels, updateModelsMap, addModelsMap,
} from '../../generic/model-store';
import {
  setsSpecialExamsEnabled,
  setsProctoredExamsEnabled,
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchCourseDenied,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
} from './slice';

// Make a copy of the sectionData and return it, but with the sequences filtered
// down to only those sequences in allowedSequences
function filterSequencesFromSection(sectionData, allowedSequences) {
  return Object.fromEntries(
    Object.entries(sectionData).map(
      ([key, value]) => [
        key,
        (key === 'sequenceIds') ? value.filter(seqId => seqId in allowedSequences) : value,
      ],
    ),
  );
}

export function fetchCourse(courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseRequest({ courseId }));
    Promise.allSettled([
      getCourseMetadata(courseId),
      getCourseBlocks(courseId),
      getLearningSequencesOutline(courseId),
    ]).then(([courseMetadataResult, courseBlocksResult, learningSequencesOutlineResult]) => {
      if (courseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'coursewareMeta',
          model: courseMetadataResult.value,
        }));
        dispatch(setsSpecialExamsEnabled({
          specialExamsEnabledWaffleFlag: courseMetadataResult.value.specialExamsEnabledWaffleFlag,
        }));
        dispatch(setsProctoredExamsEnabled({
          proctoredExamsEnabledWaffleFlag: courseMetadataResult.value.proctoredExamsEnabledWaffleFlag,
        }));
      }

      if (courseBlocksResult.status === 'fulfilled') {
        const {
          courses, sections, sequences,
        } = courseBlocksResult.value;

        // Filter the data we get from the Course Blocks API using the data we
        // get back from the Learning Sequences API (which knows to hide certain
        // sequences that users shouldn't see).
        //
        // This is temporary – all this data should come from Learning Sequences
        // soon.
        let filteredSections = sections;
        let filteredSequences = sequences;
        if (learningSequencesOutlineResult.value) {
          const allowedSequences = learningSequencesOutlineResult.value.outline.sequences;
          filteredSequences = Object.fromEntries(
            Object.entries(sequences).filter(
              ([blockId]) => blockId in allowedSequences,
            ),
          );
          filteredSections = Object.fromEntries(
            Object.entries(sections).map(
              ([blockId, sectionData]) => [blockId, filterSequencesFromSection(sectionData, allowedSequences)],
            ),
          );
        }

        // This updates the course with a sectionIds array from the blocks data.
        dispatch(updateModelsMap({
          modelType: 'coursewareMeta',
          modelsMap: courses,
        }));
        dispatch(addModelsMap({
          modelType: 'sections',
          modelsMap: filteredSections,
        }));
        // We update for sequences because fetchSequence may have already finished.
        dispatch(updateModelsMap({
          modelType: 'sequences',
          modelsMap: filteredSequences,
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

export function fetchSequence(courseId, sequenceId) {
  return async (dispatch) => {
    dispatch(fetchSequenceRequest({ sequenceId }));
    try {
      const { sequence, units } = await getSequenceMetadata(courseId, sequenceId);
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
        // We update for sequences because fetchCourse may have already finished.
        dispatch(updateModel({
          modelType: 'sequences',
          model: sequence,
        }));
        dispatch(addModels({
          modelType: 'units',
          models: units,
        }));
        dispatch(fetchSequenceSuccess({ sequenceId }));
      }
    } catch (error) {
      logError(error);
      dispatch(fetchSequenceFailure({ sequenceId }));
    }
  };
}

export function checkBlockCompletion(courseId, sequenceId, unitId) {
  return async (dispatch, getState) => {
    const { models } = getState();
    if (models.units[unitId].complete) {
      return; // do nothing. Things don't get uncompleted after they are completed.
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
    } catch (error) {
      logError(error);
    }
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

export function saveIntegritySignature(courseId) {
  return async (dispatch) => {
    try {
      await postIntegritySignature(courseId);
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

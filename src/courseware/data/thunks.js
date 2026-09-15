import { logError } from '@edx/frontend-platform/logging';
import { updateModel, updateModels } from '../../generic/model-store';
import {
  getCourseDiscussionConfig,
  getCourseOutline,
  getCourseTopics,
  getCoursewareOutlineSidebarToggles,
  postIntegritySignature,
  postSequencePosition,
} from './api';
import {
  fetchCourseOutlineRequest,
  fetchCourseOutlineSuccess,
  fetchCourseOutlineFailure,
  setCoursewareOutlineSidebarToggles,
} from './slice';

// Transitional — `fetchCourse` is being dismantled; its work is moving to React Query.
// What it used to do, and what replaced it:
//   - metadata / outline / courseHomeMeta fetches → the `useCoursewareMetadata` /
//     `useCoursewareOutline` / `useCourseHomeMeta` query hooks (+ the model-store bridge)
//   - deriving/dispatching `courseStatus` → `useCourseStatusBridge`
// Only the sidebar-toggles fetch is left; it stays on Redux until #2013 converts it and
// deletes `fetchCourse`.
export function fetchCourse(courseId) {
  return async (dispatch) => {
    try {
      const {
        enable_completion_tracking: enableCompletionTracking,
      } = await getCoursewareOutlineSidebarToggles(courseId);
      dispatch(setCoursewareOutlineSidebarToggles({ enableCompletionTracking }));
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
          models: topics.filter(topic => topic.usageKey),
          idField: 'usageKey',
        }));
      }
    } catch (error) {
      logError(error);
    }
  };
}

export function getCourseOutlineStructure(courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseOutlineRequest());
    try {
      const courseOutline = await getCourseOutline(courseId);
      dispatch(fetchCourseOutlineSuccess({ courseOutline }));
    } catch (error) {
      logError(error);
      dispatch(fetchCourseOutlineFailure());
    }
  };
}

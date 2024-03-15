import { logError } from '@edx/frontend-platform/logging';

import {
  createWholeCourseTranslationFeedbackFailure,
  createWholeCourseTranslationFeedbackRequest,
  createWholeCourseTranslationFeedbackSuccess,
  fetchWholeCourseTranslationFeedbackFailure,
  fetchWholeCourseTranslationFeedbackRequest,
  fetchWholeCourseTranslationFeedbackSuccess,
} from './slice';
import { createTranslationFeedback, getTranslationFeedback } from './api';
import { updateModel } from '../../../../../../generic/model-store';

export function fetchWholeCourseTranslationFeedback(
  courseId,
  translationLanguage,
  unitId,
  userId,
) {
  return async (dispatch) => {
    dispatch(fetchWholeCourseTranslationFeedbackRequest({
      courseId,
    }));
    try {
      const existingFeedback = await getTranslationFeedback(
        courseId,
        translationLanguage,
        unitId,
        userId,
      );
      dispatch(updateModel({
        modelType: 'coursewareMeta',
        model: {
          id: courseId,
          translationFeedback: existingFeedback ? {
            translationLanguage,
            unitId,
            userId,
            feedbackValue: existingFeedback?.feedbackValue,
          } : null,
        },
      }));
      dispatch(fetchWholeCourseTranslationFeedbackSuccess({
        courseId,
      }));
    } catch (error) {
      logError(error);
      dispatch(fetchWholeCourseTranslationFeedbackFailure({
        courseId,
      }));
    }
  };
}

export function createWholeCourseTranslationFeedback(
  courseId,
  feedbackValue,
  translationLanguage,
  unitId,
  userId,
) {
  return async (dispatch) => {
    dispatch(createWholeCourseTranslationFeedbackRequest({
      courseId,
    }));
    try {
      const newFeedback = await createTranslationFeedback(
        courseId,
        feedbackValue,
        translationLanguage,
        unitId,
        userId,
      );
      dispatch(updateModel({
        modelType: 'coursewareMeta',
        model: {
          id: courseId,
          translationFeedback: {
            translationLanguage,
            unitId,
            userId,
            feedbackValue: newFeedback.feedbackValue,
          },
        },
      }));
      dispatch(createWholeCourseTranslationFeedbackSuccess({
        courseId,
      }));
    } catch (error) {
      logError(error);
      dispatch(createWholeCourseTranslationFeedbackFailure({
        courseId,
      }));
    }
  };
}

import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useModel } from '../../../../../generic/model-store';
import {
  createWholeCourseTranslationFeedback,
  fetchWholeCourseTranslationFeedback,
} from './data';

const useFeedbackWidget = ({
  courseId,
  translationLanguage,
  unitId,
  userId,
}) => {
  const dispatch = useDispatch();
  const { translationFeedback } = useModel('coursewareMeta', courseId);
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(false);
  const [showGratitudeText, setShowGratitudeText] = useState(false);

  const closeFeedbackWidget = useCallback(() => {
    setShowFeedbackWidget(false);
  }, [setShowFeedbackWidget]);

  const openFeedbackWidget = useCallback(() => {
    setShowFeedbackWidget(true);
  }, [setShowFeedbackWidget]);

  useEffect(() => {
    dispatch(fetchWholeCourseTranslationFeedback(
      courseId,
      translationLanguage,
      unitId,
      userId,
    ));
  }, [
    courseId,
    translationLanguage,
    unitId,
    userId,
    openFeedbackWidget,
  ]);

  useEffect(() => {
    setShowFeedbackWidget(!translationFeedback);
  }, [translationFeedback]);

  const openGratitudeText = useCallback(() => {
    setShowGratitudeText(true);
    setTimeout(() => {
      setShowGratitudeText(false);
    }, 3000);
  }, [setShowGratitudeText]);

  const sendFeedback = useCallback((feedbackValue) => {
    dispatch(createWholeCourseTranslationFeedback(
      courseId,
      feedbackValue,
      translationLanguage,
      unitId,
      userId,
    ));
    closeFeedbackWidget();
    openGratitudeText();
  }, [
    courseId,
    translationLanguage,
    unitId,
    userId,
    closeFeedbackWidget,
    openGratitudeText,
  ]);

  return {
    closeFeedbackWidget,
    openFeedbackWidget,
    openGratitudeText,
    sendFeedback,
    showFeedbackWidget,
    showGratitudeText,
  };
};

export default useFeedbackWidget;

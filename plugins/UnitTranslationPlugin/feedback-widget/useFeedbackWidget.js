import { useCallback, useEffect, useState } from 'react';

import { createTranslationFeedback, getTranslationFeedback } from '../data/api';

const useFeedbackWidget = ({
  courseId,
  translationLanguage,
  unitId,
  userId,
}) => {
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(false);
  const [showGratitudeText, setShowGratitudeText] = useState(false);

  const closeFeedbackWidget = useCallback(() => {
    setShowFeedbackWidget(false);
  }, [setShowFeedbackWidget]);

  const openFeedbackWidget = useCallback(() => {
    setShowFeedbackWidget(true);
  }, [setShowFeedbackWidget]);

  useEffect(async () => {
    const translationFeedback = await getTranslationFeedback({
      courseId,
      translationLanguage,
      unitId,
      userId,
    });
    setShowFeedbackWidget(!translationFeedback);
  }, [
    courseId,
    translationLanguage,
    unitId,
    userId,
  ]);

  const openGratitudeText = useCallback(() => {
    setShowGratitudeText(true);
    setTimeout(() => {
      setShowGratitudeText(false);
    }, 3000);
  }, [setShowGratitudeText]);

  const sendFeedback = useCallback(async (feedbackValue) => {
    await createTranslationFeedback({
      courseId,
      feedbackValue,
      translationLanguage,
      unitId,
      userId,
    });
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

  const onThumbsUpClick = useCallback(() => {
    sendFeedback(true);
  }, [sendFeedback]);
  const onThumbsDownClick = useCallback(() => {
    sendFeedback(false);
  }, [sendFeedback]);

  return {
    closeFeedbackWidget,
    openFeedbackWidget,
    openGratitudeText,
    sendFeedback,
    showFeedbackWidget,
    showGratitudeText,
    onThumbsUpClick,
    onThumbsDownClick,
  };
};

export default useFeedbackWidget;

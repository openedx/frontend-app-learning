import { useCallback, useState } from 'react';

const useFeedbackWidget = ({
  courseId,
  languageCode,
  userId,
  unitId,
}) => {
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(true);
  const [showGratitudeText, setShowGratitudeText] = useState(false);

  const openFeedbackWidget = () => {
    setShowFeedbackWidget(true);
  };

  const closeFeedbackWidget = () => {
    setShowFeedbackWidget(false);
  };

  const openGratitudeText = () => {
    setShowGratitudeText(true);
    setTimeout(() => {
      setShowGratitudeText(false);
    }, 3000);
  };

  const sendFeedback = useCallback(() => {
    // Create feedback
    closeFeedbackWidget();
    openGratitudeText();
  }, [courseId, userId, unitId, languageCode]);

  return {
    closeFeedbackWidget,
    openFeedbackWidget,
    sendFeedback,
    showFeedbackWidget,
    showGratitudeText,
  };
};

export default useFeedbackWidget;

import { useCallback, useState } from 'react';

const useFeedbackWidget = () => {
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(true);
  const [showGratitudeText, setShowGratitudeText] = useState(false);

  const closeFeedbackWidget = useCallback(() => {
    setShowFeedbackWidget(false);
  }, [setShowFeedbackWidget]);

  const openFeedbackWidget = useCallback(() => {
    setShowFeedbackWidget(true);
  }, [setShowFeedbackWidget]);

  const openGratitudeText = useCallback(() => {
    setShowGratitudeText(true);
    setTimeout(() => {
      setShowGratitudeText(false);
    }, 3000);
  }, [setShowGratitudeText]);

  const sendFeedback = useCallback(() => {
    // Create feedback
    closeFeedbackWidget();
    openGratitudeText();
  }, [closeFeedbackWidget, openGratitudeText]);

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

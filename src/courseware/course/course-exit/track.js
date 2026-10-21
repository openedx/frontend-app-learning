import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { FAILED, LOADED } from '@src/constants';

export const trackRecommendationsViewed = ({ courseKey, isError, length }) => {
  sendTrackEvent('edx.ui.lms.course_exit.recommendations.viewed', {
    course_key: courseKey,
    recommendations_status: isError ? FAILED : LOADED,
    recommendations_length: length,
  });
};

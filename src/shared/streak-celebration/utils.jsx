import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { updateModel } from '../../generic/model-store';

function recordStreakCelebration(org, courseId) {
  // Tell our analytics
  const { administrator } = getAuthenticatedUser();
  sendTrackEvent('edx.ui.lms.celebration.streak.opened', {
    org_key: org,
    courserun_key: courseId,
    is_staff: administrator,
  });
}

function recordModalClosing(celebrations, org, courseId, dispatch) {
  // Ensure we only celebrate each streak once
  dispatch(updateModel({
    modelType: 'courseHomeMeta',
    model: {
      id: courseId,
      celebrations: { ...celebrations, streakLengthToCelebrate: null },
    },
  }));
}

export { recordStreakCelebration, recordModalClosing };

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { setFirstSectionCelebrationComplete } from '../../../data/api';
import { clearLocalStorage, getLocalStorage, setLocalStorage } from '../../../data/localStorage';

const CELEBRATION_LOCAL_STORAGE_KEY = 'CelebrationModal.showOnSectionLoad';

// Records clicks through the end of a section, so that we can know whether we should celebrate when we finish loading
function handleNextSectionCelebration(sequenceId, nextSequenceId) {
  setLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY, {
    prevSequenceId: sequenceId,
    nextSequenceId,
  });
}

function recordFirstSectionCelebration(courseId) {
  // Tell the LMS
  setFirstSectionCelebrationComplete(courseId);

  // Tell our analytics
  const { administrator } = getAuthenticatedUser();
  sendTrackEvent('edx.ui.lms.celebration.first_section.opened', {
    course_id: courseId,
    is_staff: administrator,
  });
}

// Looks at local storage to see whether we just came from the end of a section.
// Note! This does have side effects (will clear some local storage and may start an api call).
function shouldCelebrateOnSectionLoad(courseId, sequenceId, celebrateFirstSection) {
  const celebrationIds = getLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY);
  if (!celebrationIds) {
    return false;
  }

  const {
    prevSequenceId,
    nextSequenceId,
  } = celebrationIds;
  const shouldCelebrate = sequenceId === nextSequenceId && celebrateFirstSection;

  if (sequenceId !== prevSequenceId && sequenceId !== nextSequenceId) {
    // Don't clear until we move off of current/prev sequence
    clearLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY);
  }

  return shouldCelebrate;
}

export { handleNextSectionCelebration, recordFirstSectionCelebration, shouldCelebrateOnSectionLoad };

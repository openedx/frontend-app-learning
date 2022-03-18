import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { postCelebrationComplete } from './data/api';
import { clearLocalStorage, getLocalStorage, setLocalStorage } from '../../../data/localStorage';
import { updateModel } from '../../../generic/model-store';

const CELEBRATION_LOCAL_STORAGE_KEY = 'CelebrationModal.showOnSectionLoad';

// Records clicks through the end of a section, so that we can know whether we should celebrate when we finish loading
function handleNextSectionCelebration(sequenceId, nextSequenceId) {
  setLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY, {
    prevSequenceId: sequenceId,
    nextSequenceId,
  });
}

function recordFirstSectionCelebration(org, courseId) {
  // Tell the LMS
  postCelebrationComplete(courseId, { first_section: false });

  // Tell our analytics
  const { administrator } = getAuthenticatedUser();
  sendTrackEvent('edx.ui.lms.celebration.first_section.opened', {
    org_key: org,
    courserun_key: courseId,
    course_id: courseId, // should only be courserun_key, but left as-is for historical reasons
    is_staff: administrator,
  });
}

function recordWeeklyGoalCelebration(org, courseId) {
  // Tell the LMS
  postCelebrationComplete(courseId, { weekly_goal: false });

  // Tell our analytics
  const { administrator } = getAuthenticatedUser();
  sendTrackEvent('edx.ui.lms.celebration.weekly_goal.opened', {
    org_key: org,
    courserun_key: courseId,
    is_staff: administrator,
  });
}

// Looks at local storage to see whether we just came from the end of a section.
// Note! This does have side effects (will clear some local storage and may start an api call).
function shouldCelebrateOnSectionLoad(courseId, sequenceId, celebrateFirstSection, dispatch, celebrations) {
  const celebrationIds = getLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY);
  if (!celebrationIds) {
    return false;
  }

  const {
    prevSequenceId,
    nextSequenceId,
  } = celebrationIds;
  const onTargetSequence = sequenceId === nextSequenceId;
  let shouldCelebrate = onTargetSequence && celebrateFirstSection;

  if (shouldCelebrate && celebrations.streakLengthToCelebrate) {
    // We don't want two modals to show up on the same page.
    // If we are going to celebrate a streak then we will not also celebrate the first section.
    // We will still mark the first section as celebrated, so that we don't incorrectly celebrate the second section.
    shouldCelebrate = false;
    postCelebrationComplete(courseId, { first_section: false });
  }

  if (sequenceId !== prevSequenceId && !onTargetSequence) {
    // Don't clear until we move off of current/prev sequence
    clearLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY);

    // Update our local copy of course data from LMS
    dispatch(updateModel({
      modelType: 'courseHomeMeta',
      model: {
        id: courseId,
        celebrations: {
          ...celebrations,
          firstSection: false,
        },
      },
    }));
  }

  return shouldCelebrate;
}

export {
  handleNextSectionCelebration,
  recordFirstSectionCelebration,
  recordWeeklyGoalCelebration,
  shouldCelebrateOnSectionLoad,
};

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { postCelebrationComplete } from './data/api';
import { clearLocalStorage, getLocalStorage, setLocalStorage } from '../../../data/localStorage';
import { updateModel } from '../../../generic/model-store';

const CELEBRATION_LOCAL_STORAGE_KEY = 'FirstSectionCelebrationModal.showOnSectionLoad';

// Records clicks through the end of a section, so that we can know whether we should celebrate when we finish loading
function handleNextSectionCelebration(sequenceId, nextSequenceId, nextUnitId) {
  setLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY, {
    prevSequenceId: sequenceId,
    nextSequenceId,
    nextUnitId,
  });
}

function sendCelebrationSegmentEvent(courseId, eventName) {
  const { administrator } = getAuthenticatedUser();
  sendTrackEvent(eventName, {
    course_id: courseId,
    is_staff: administrator,
  });
}

function recordFirstSectionCelebration(courseId) {
  // Tell the LMS
  postCelebrationComplete(courseId, { first_section: false });

  // Tell our analytics
  sendCelebrationSegmentEvent(courseId, 'edx.ui.lms.celebration.first_section.opened');
}

function recordFirstDiscussionCelebration(courseId) {
  /* postCelebrationComplete should start being used once the Discussion MFE exists
     and we no longer record the first discussion post in the JS handler in edx-platform
     See edx-platform/common/static/common/js/discussion/views/new_post_view.js and
     edx-platform/cms/static/common/js/discussion/views/discussion_thread_view.js */
  // Tell the LMS
  // postCelebrationComplete(courseId, {first_discussion: false});

  // Tell our analytics
  sendCelebrationSegmentEvent(courseId, 'edx.ui.lms.celebration.first_discussion.opened');
}

// Looks at local storage to see whether we just came from the end of a section.
// Note! This does have side effects (will clear some local storage and may start an api call).
function shouldCelebrateOnSectionLoad(courseId, sequenceId, unitId, celebrateFirstSection, dispatch) {
  const celebrationIds = getLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY);
  if (!celebrationIds) {
    return false;
  }

  const {
    prevSequenceId,
    nextSequenceId,
    nextUnitId,
  } = celebrationIds;
  const onTargetUnit = sequenceId === nextSequenceId && (!nextUnitId || unitId === nextUnitId);
  const shouldCelebrate = onTargetUnit && celebrateFirstSection;

  if (sequenceId !== prevSequenceId && !onTargetUnit) {
    // Don't clear until we move off of current/prev sequence
    clearLocalStorage(CELEBRATION_LOCAL_STORAGE_KEY);

    // Update our local copy of course data from LMS
    dispatch(updateModel({
      modelType: 'courses',
      model: {
        id: courseId,
        celebrations: {
          firstSection: false,
        },
      },
    }));
  }

  return shouldCelebrate;
}

function shouldCelebrateOnDiscussionPost(firstDiscussion, firstDiscussionUserBucket) {
  // Bucket 0 === Control group which does not get the discussion celebration.
  // That check can be removed when we stop using the flag as an experiment.
  return firstDiscussion && firstDiscussionUserBucket === 0;
}

export {
  handleNextSectionCelebration,
  recordFirstDiscussionCelebration,
  recordFirstSectionCelebration,
  shouldCelebrateOnSectionLoad,
  shouldCelebrateOnDiscussionPost,
};

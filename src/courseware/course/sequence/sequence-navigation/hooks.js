import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { breakpoints, useWindowSize } from '@openedx/paragon';

import { useModel } from '../../../../generic/model-store';
import { sequenceIdsSelector } from '../../../data';
import SidebarContext from '../../sidebar/SidebarContext';
import NewSidebarContext from '../../new-sidebar/SidebarContext';
import { WIDGETS } from '../../../../constants';

export function useSequenceNavigationMetadata(currentSequenceId, currentUnitId) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  const sequence = useModel('sequences', currentSequenceId);
  const courseId = useSelector(state => state.courseware.courseId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const { entranceExamData: { entranceExamPassed } } = useModel('coursewareMeta', courseId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  // If we don't know the sequence and unit yet, then assume no.
  if (courseStatus !== 'loaded' || sequenceStatus !== 'loaded' || !currentSequenceId || !currentUnitId) {
    return {
      isFirstUnit: false,
      isLastUnit: false,
      navigationDisabledNextSequence: false,
      navigationDisabledPrevSequence: false,
    };
  }

  // if entrance exam is not passed then we should treat this as 1st and last unit
  if (entranceExamPassed === false) {
    return {
      isFirstUnit: true,
      isLastUnit: true,
      navigationDisabledNextSequence: false,
      navigationDisabledPrevSequence: false,
    };
  }

  const sequenceIndex = sequenceIds.indexOf(currentSequenceId);
  const unitIndex = sequence.unitIds.indexOf(currentUnitId);

  const isFirstSequence = sequenceIndex === 0;
  const isFirstUnitInSequence = unitIndex === 0;
  const isFirstUnit = isFirstSequence && isFirstUnitInSequence;
  const isLastSequence = sequenceIndex === sequenceIds.length - 1;
  const isLastUnitInSequence = unitIndex === sequence.unitIds.length - 1;
  const isLastUnit = isLastSequence && isLastUnitInSequence;
  const sequenceNavigationDisabled = sequence.navigationDisabled;
  const navigationDisabledPrevSequence = sequenceNavigationDisabled && isFirstUnitInSequence;
  const navigationDisabledNextSequence = sequenceNavigationDisabled && isLastUnitInSequence;

  const nextSequenceId = sequenceIndex < sequenceIds.length - 1 ? sequenceIds[sequenceIndex + 1] : null;
  const previousSequenceId = sequenceIndex > 0 ? sequenceIds[sequenceIndex - 1] : null;

  let nextLink;
  if (isLastUnit) {
    nextLink = `/course/${courseId}/course-end`;
  } else {
    const nextIndex = unitIndex + 1;
    if (nextIndex < sequence.unitIds.length) {
      const nextUnitId = sequence.unitIds[nextIndex];
      nextLink = `/course/${courseId}/${currentSequenceId}/${nextUnitId}`;
    } else if (nextSequenceId) {
      nextLink = `/course/${courseId}/${nextSequenceId}/first`;
    }
  }

  let previousLink;
  const previousIndex = unitIndex - 1;
  if (previousIndex >= 0) {
    const previousUnitId = sequence.unitIds[previousIndex];
    previousLink = `/course/${courseId}/${currentSequenceId}/${previousUnitId}`;
  } else if (previousSequenceId) {
    previousLink = `/course/${courseId}/${previousSequenceId}/last`;
  }

  return {
    isFirstUnit,
    isLastUnit,
    nextLink,
    previousLink,
    navigationDisabledNextSequence,
    navigationDisabledPrevSequence,
  };
}

export function useIsOnMediumDesktop() {
  const windowSize = useWindowSize();
  return windowSize.width >= breakpoints.medium.minWidth && windowSize.width < breakpoints.extraLarge.minWidth;
}

export function useIsOnLargeDesktop() {
  const windowSize = useWindowSize();
  return windowSize.width >= breakpoints.extraLarge.minWidth && windowSize.width < breakpoints.extraLarge.maxWidth;
}

export function useIsOnXLDesktop() {
  const windowSize = useWindowSize();
  return windowSize.width >= breakpoints.extraLarge.maxWidth;
}

export function useIsSidebarOpen(unitId) {
  const courseId = useSelector(state => state.courseware.courseId);
  const { isNewDiscussionSidebarViewEnabled } = useModel('courseHomeMeta', courseId);
  const { currentSidebar } = useContext(isNewDiscussionSidebarViewEnabled ? NewSidebarContext : SidebarContext);
  const topic = useModel('discussionTopics', unitId);

  return (currentSidebar === WIDGETS.NOTIFICATIONS) || (currentSidebar === 'DISCUSSIONS_NOTIFICATIONS') || (
    currentSidebar === WIDGETS.DISCUSSIONS && !!(topic?.id || topic?.enabledInContext));
}

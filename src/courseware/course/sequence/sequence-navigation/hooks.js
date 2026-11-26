import { breakpoints, useWindowSize } from '@openedx/paragon';

import {
  useCoursewareMetadata, useIsCourseLoaded, useIsPreview, useSequenceIds, useSequenceMetadata,
} from '@src/courseware/data/apiHooks';
import { getCourseExitUrl, getCoursewarePath } from '@src/courseware/urls';
import { useSidebar } from '../../sidebar/SidebarContext';
import { useCourseId } from '@src/generic/course-params';

// The links are the paths the router navigates to, under the /preview prefix while previewing.

export function useSequenceNavigationMetadata(currentSequenceId, currentUnitId) {
  const courseId = useCourseId();
  const isPreview = useIsPreview();
  const sequenceIds = useSequenceIds(courseId);
  const isCourseLoaded = useIsCourseLoaded(courseId);
  const {
    entranceExamData: { entranceExamPassed } = {},
  } = useCoursewareMetadata(courseId, { enabled: false }).data ?? {};
  const sequenceQuery = useSequenceMetadata(currentSequenceId, { enabled: false });
  const sequence = sequenceQuery.data?.sequence;

  // If we don't know the sequence and unit yet, then assume no.
  if (!isCourseLoaded || !sequenceQuery.isSuccess || !currentSequenceId || !currentUnitId) {
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
    nextLink = getCourseExitUrl(courseId);
  } else {
    const nextIndex = unitIndex + 1;
    if (nextIndex < sequence.unitIds.length) {
      const nextUnitId = sequence.unitIds[nextIndex];
      nextLink = getCoursewarePath(isPreview, courseId, currentSequenceId, nextUnitId);
    } else if (nextSequenceId) {
      nextLink = getCoursewarePath(isPreview, courseId, nextSequenceId, 'first');
    }
  }

  let previousLink;
  const previousIndex = unitIndex - 1;
  if (previousIndex >= 0) {
    const previousUnitId = sequence.unitIds[previousIndex];
    previousLink = getCoursewarePath(isPreview, courseId, currentSequenceId, previousUnitId);
  } else if (previousSequenceId) {
    previousLink = getCoursewarePath(isPreview, courseId, previousSequenceId, 'last');
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

export function useIsSidebarOpen() {
  const { currentSidebar, availableSidebarIds } = useSidebar();
  return availableSidebarIds.includes(currentSidebar);
}

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { defaultMemoize as memoize } from 'reselect';

import { useCourseHomeMeta } from '../course-home/data/apiHooks';
import {
  useCheckBlockCompletion,
  useCoursewareMetadata,
  useMinimalCourseOutline,
  useSaveSequencePosition,
  useSequenceIds,
  useSequenceMetadata,
} from './data/apiHooks';
import { readModels } from './data/modelReader';
import { useCoursewareRedirects } from './redirects';
import { TabPage } from '../tab-page';
import type { RootState } from '../store';

import Course from './course';
import { handleNextSectionCelebration } from './course/celebration';

const CoursewareContainer = () => {
  const {
    courseId,
    sequenceId,
    unitId: routeUnitId,
  } = useParams();

  const checkBlockCompletion = useCheckBlockCompletion();
  const saveSequencePosition = useSaveSequencePosition();

  const metadataQuery = useCoursewareMetadata(courseId);
  const courseHomeMetaQuery = useCourseHomeMeta(courseId);
  const sequenceQuery = useSequenceMetadata(sequenceId);
  const isSequenceLoaded = sequenceQuery.isSuccess;

  useCoursewareRedirects();

  const course = useSelector(
    (state: RootState) => (courseId ? readModels(state).coursewareMeta?.[courseId] : null) ?? null,
  );
  const sequence = sequenceQuery.data?.sequence ?? null;
  const minimalCourseOutline = useMinimalCourseOutline(courseId, { enabled: false }).data;
  const sectionId = sequenceId ? minimalCourseOutline?.sequences[sequenceId]?.sectionId : undefined;

  const sequenceIds = useSequenceIds(courseId);
  let nextSequenceId: string | null = null;
  if (sequenceId && sequenceIds.length > 0) {
    const sequenceIndex = sequenceIds.indexOf(sequenceId);
    nextSequenceId = sequenceIndex < sequenceIds.length - 1 ? sequenceIds[sequenceIndex + 1] : null;
  }
  const nextSectionId = nextSequenceId ? minimalCourseOutline?.sequences[nextSequenceId]?.sectionId : undefined;

  const latest = useRef<any>();

  const guards = useRef<any>();
  if (!guards.current) {
    guards.current = {
      checkSaveSequencePosition: memoize((unitId) => {
        const {
          courseId: cId,
          sequenceId: sId,
          isSequenceLoaded: sLoaded,
          sequence: seq,
        } = latest.current;
        if (sLoaded && seq.saveUnitPosition && unitId) {
          const activeUnitIndex = seq.unitIds.indexOf(unitId);
          saveSequencePosition(cId, sId, activeUnitIndex);
        }
      }),
    };
  }

  useEffect(() => {
    latest.current = {
      courseId,
      sequenceId,
      isSequenceLoaded,
      sequence,
    };
    const { checkSaveSequencePosition } = guards.current;

    // Check if we should save our sequence position.  Only do this when the route unit ID changes.
    checkSaveSequencePosition(routeUnitId);
  });

  const handleUnitNavigationClick = () => {
    checkBlockCompletion(courseId, sequenceId, routeUnitId);
  };

  const handleNextSequenceClick = () => {
    if (nextSequenceId && nextSectionId) {
      const celebrateFirstSection = course && course.celebrations && course.celebrations.firstSection;
      if (celebrateFirstSection && sectionId !== nextSectionId) {
        handleNextSectionCelebration(sequenceId, nextSequenceId);
      }
    }
  };

  const handlePreviousSequenceClick = () => {};

  return (
    <TabPage
      activeTabSlug="courseware"
      courseId={courseId}
      unitId={routeUnitId}
      courseStatus={{ metadataQuery: courseHomeMetaQuery, tabDataQuery: metadataQuery }}
    >
      <Course
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={routeUnitId}
        nextSequenceHandler={handleNextSequenceClick}
        previousSequenceHandler={handlePreviousSequenceClick}
        unitNavigationHandler={handleUnitNavigationClick}
      />
    </TabPage>
  );
};

export default CoursewareContainer;

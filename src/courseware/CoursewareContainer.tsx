import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useCourseHomeMeta } from '../course-home/data/apiHooks';
import {
  useCheckBlockCompletion,
  useCoursewareMetadata,
  useMinimalCourseOutline,
  useSaveSequencePosition,
  useSequenceIds,
  useSequenceMetadata,
} from './data/apiHooks';
import CoursewareRedirects from './CoursewareRedirects';
import { TabPage } from '../tab-page';

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

  const coursewareMetadataQuery = useCoursewareMetadata(courseId);
  const courseHomeMetaQuery = useCourseHomeMeta(courseId);
  const sequenceQuery = useSequenceMetadata(sequenceId);
  const isSequenceLoaded = sequenceQuery.isSuccess;

  const sequence = sequenceQuery.data?.sequence ?? null;
  const minimalCourseOutline = useMinimalCourseOutline(courseId).data;
  const sectionId = sequenceId ? minimalCourseOutline?.sequences[sequenceId]?.sectionId : undefined;

  const sequenceIds = useSequenceIds(courseId);
  let nextSequenceId: string | null = null;
  if (sequenceId && sequenceIds.length > 0) {
    const sequenceIndex = sequenceIds.indexOf(sequenceId);
    nextSequenceId = sequenceIndex < sequenceIds.length - 1 ? sequenceIds[sequenceIndex + 1] : null;
  }
  const nextSectionId = nextSequenceId ? minimalCourseOutline?.sequences[nextSequenceId]?.sectionId : undefined;

  useEffect(() => {
    if (isSequenceLoaded && sequence?.saveUnitPosition && routeUnitId) {
      saveSequencePosition(courseId, sequenceId, sequence.unitIds.indexOf(routeUnitId));
    }
  }, [routeUnitId]); // only when the route's unit changes; the sequence loading later must not save

  const handleUnitNavigationClick = () => {
    checkBlockCompletion(courseId, sequenceId, routeUnitId);
  };

  const handleNextSequenceClick = () => {
    if (nextSequenceId && nextSectionId) {
      const celebrateFirstSection = coursewareMetadataQuery.data?.celebrations.firstSection;
      if (celebrateFirstSection && sectionId !== nextSectionId) {
        handleNextSectionCelebration(sequenceId, nextSequenceId);
      }
    }
  };

  const handlePreviousSequenceClick = () => {};

  return (
    <>
      <CoursewareRedirects />
      <TabPage
        activeTabSlug="courseware"
        courseId={courseId}
        unitId={routeUnitId}
        courseStatus={{ metadataQuery: courseHomeMetaQuery, tabDataQuery: coursewareMetadataQuery }}
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
    </>
  );
};

export default CoursewareContainer;

import { useEffect, useRef } from 'react';

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
import { CourseParamsProvider } from '../generic/course-params';
import LearningWidgetProviders from '../generic/LearningWidgetProviders';
import ProductTours from '../product-tours/ProductTours';

import Course from './course';
import { handleNextSectionCelebration } from './course/celebration';

interface Props {
  courseId: string;
  sequenceId?: string;
  unitId?: string;
  isPreview?: boolean;
}

const CoursewareContent = ({
  courseId, sequenceId, routeUnitId,
}: { courseId: string; sequenceId?: string; routeUnitId?: string }) => {
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

  const handledUnitId = useRef<string>();
  useEffect(() => {
    // only when the route's unit changes; the sequence loading later must not save
    if (handledUnitId.current === routeUnitId) {
      return;
    }
    handledUnitId.current = routeUnitId;
    if (isSequenceLoaded && sequence?.saveUnitPosition && routeUnitId) {
      saveSequencePosition(courseId, sequenceId, sequence.unitIds.indexOf(routeUnitId));
    }
  }, [courseId, isSequenceLoaded, routeUnitId, saveSequencePosition, sequence?.saveUnitPosition, sequence?.unitIds, sequenceId]);

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
        courseId={courseId}
        courseStatus={{ metadataQuery: courseHomeMetaQuery, tabDataQuery: coursewareMetadataQuery }}
        // The <main> landmark is the sequence's, so the sidebars stay outside it.
        ownsMainLandmark
        renderTours={({ isStreakCelebrationOpen }) => (
          <ProductTours
            activeTab="courseware"
            courseId={courseId}
            isStreakCelebrationOpen={isStreakCelebrationOpen}
            // The frame renders tours once the metadata has loaded.
            org={courseHomeMetaQuery.data?.org ?? ''}
          />
        )}
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

const CoursewareContainer = ({
  courseId, sequenceId, unitId, isPreview = false,
}: Props) => (
  <LearningWidgetProviders>
    {/* The sequence metadata query reads isPreview, so the provider sits above every query. */}
    <CourseParamsProvider courseId={courseId} sequenceId={sequenceId} unitId={unitId} isPreview={isPreview}>
      <CoursewareContent courseId={courseId} sequenceId={sequenceId} routeUnitId={unitId} />
    </CourseParamsProvider>
  </LearningWidgetProviders>
);

export default CoursewareContainer;

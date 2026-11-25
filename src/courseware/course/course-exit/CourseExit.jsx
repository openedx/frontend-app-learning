import { useEffect } from 'react';

import { Navigate } from 'react-router-dom';

import CourseExitViewCoursesSlot from '@src/slots/CourseExitSlots/CourseExitViewCoursesSlot';
import CourseCelebration from './CourseCelebration';
import CourseInProgress from './CourseInProgress';
import CourseNonPassing from './CourseNonPassing';
import { COURSE_EXIT_MODES, getCourseExitMode } from './utils';
import { postUnsubscribeFromGoalReminders } from './data/api';

import { TabWithTimer } from '../../../tab-page';
import ProductTours from '../../../product-tours/ProductTours';
import { useCoursewareMetadata, useMinimalCourseOutline } from '../../data/apiHooks';
import { useCourseHomeMeta } from '../../../course-home/data/apiHooks';
import { getCourseOutlineUrl, getCoursewareUrl } from '../../urls';
import { useCourseId } from '@src/generic/course-params';

const CourseExitContent = () => {
  const courseId = useCourseId();
  const {
    certificateData,
    courseExitPageIsActive,
    courseGoals,
    enrollmentMode,
    isEnrolled,
    userHasPassingGrade,
  } = useCoursewareMetadata(courseId, { enabled: false }).data ?? {};
  const hasScheduledContent = (
    useMinimalCourseOutline(courseId, { enabled: false }).data?.courses[courseId].hasScheduledContent
  );

  const {
    isMasquerading,
    canViewCertificate,
  } = useCourseHomeMeta(courseId, { enabled: false }).data ?? {};

  const mode = getCourseExitMode(
    certificateData,
    hasScheduledContent,
    isEnrolled,
    userHasPassingGrade,
    courseExitPageIsActive,
    canViewCertificate,
  );

  // Audit users cannot fully complete a course, so we will
  // unsubscribe them from goal reminders once they reach the course exit page
  // to avoid spamming them with goal reminder emails
  const shouldUnsubscribe = !!courseGoals && enrollmentMode === 'audit' && !isMasquerading;
  useEffect(() => {
    if (shouldUnsubscribe) {
      postUnsubscribeFromGoalReminders(courseId);
    }
  }, [shouldUnsubscribe, courseId]);

  let body = null;
  if (mode === COURSE_EXIT_MODES.nonPassing) {
    body = (<CourseNonPassing />);
  } else if (mode === COURSE_EXIT_MODES.inProgress) {
    body = (<CourseInProgress />);
  } else if (mode === COURSE_EXIT_MODES.celebration) {
    body = (<CourseCelebration />);
  } else {
    return (<Navigate to={getCoursewareUrl(courseId)} replace />);
  }

  // The courseware tab leaves the <main> landmark to its page, as the unit page does in Sequence.
  return (
    <main className="d-flex flex-column flex-grow-1">
      <CourseExitViewCoursesSlot courseId={courseId} />
      {body}
    </main>
  );
};

const CourseExit = () => {
  const courseId = useCourseId();
  const metadataQuery = useCoursewareMetadata(courseId);
  const courseHomeMetaQuery = useCourseHomeMeta(courseId);
  const outlineQuery = useMinimalCourseOutline(courseId);

  if (outlineQuery.isError && courseHomeMetaQuery.data?.courseAccess?.hasAccess) {
    return (<Navigate to={getCourseOutlineUrl(courseId)} replace />);
  }

  return (
    <TabWithTimer
      courseId={courseId}
      courseStatus={{ metadataQuery: courseHomeMetaQuery, tabDataQueries: [metadataQuery, outlineQuery] }}
      // As on the courseware: the <main> landmark is the content's own, and the courseware's tours run here too.
      ownsMainLandmark
      renderTours={({ isStreakCelebrationOpen }) => (
        <ProductTours
          activeTab="courseware"
          courseId={courseId}
          isStreakCelebrationOpen={isStreakCelebrationOpen}
          org={courseHomeMetaQuery.data?.org}
        />
      )}
    >
      <CourseExitContent />
    </TabWithTimer>
  );
};

export default CourseExit;

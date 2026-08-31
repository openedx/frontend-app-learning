import { useEffect } from 'react';

import { Navigate, useParams } from 'react-router-dom';

import CourseCelebration from './CourseCelebration';
import CourseInProgress from './CourseInProgress';
import CourseNonPassing from './CourseNonPassing';
import { COURSE_EXIT_MODES, getCourseExitMode } from './utils';
import { postUnsubscribeFromGoalReminders } from './data/api';
import { CourseExitViewCoursesPluginSlot } from '../../../plugin-slots/CourseExitPluginSlots';

import { useModel } from '../../../generic/model-store';
import { TabWithTimer } from '../../../tab-page';
import { useCoursewareMetadata, useCoursewareOutline } from '../../data/apiHooks';
import { useCourseExitStatusBridge } from '../../data/statusBridge';
import { useCourseHomeMeta } from '../../../course-home/data/apiHooks';

const CourseExitContent = () => {
  const { courseId } = useParams();
  const {
    certificateData,
    courseExitPageIsActive,
    courseGoals,
    enrollmentMode,
    hasScheduledContent,
    isEnrolled,
    userHasPassingGrade,
  } = useModel('coursewareMeta', courseId);

  const {
    isMasquerading,
    canViewCertificate,
  } = useModel('courseHomeMeta', courseId);

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
  if (courseGoals && enrollmentMode === 'audit' && !isMasquerading) {
    useEffect(() => {
      postUnsubscribeFromGoalReminders(courseId);
    }, []);
  }

  let body = null;
  if (mode === COURSE_EXIT_MODES.nonPassing) {
    body = (<CourseNonPassing />);
  } else if (mode === COURSE_EXIT_MODES.inProgress) {
    body = (<CourseInProgress />);
  } else if (mode === COURSE_EXIT_MODES.celebration) {
    body = (<CourseCelebration />);
  } else {
    return (<Navigate to={`/course/${courseId}`} replace />);
  }

  return (
    <>
      <CourseExitViewCoursesPluginSlot />
      {body}
    </>
  );
};

const CourseExit = () => {
  const { courseId } = useParams();
  const metadataQuery = useCoursewareMetadata(courseId);
  const courseHomeMetaQuery = useCourseHomeMeta(courseId, 'courseware');
  useCoursewareOutline(courseId);
  useCourseExitStatusBridge(courseId, metadataQuery, courseHomeMetaQuery);

  return (
    <TabWithTimer
      activeTabSlug="courseware"
      courseId={courseId}
      courseStatus={{ metadataQuery: courseHomeMetaQuery, tabDataQuery: metadataQuery }}
    >
      <CourseExitContent />
    </TabWithTimer>
  );
};

export default CourseExit;

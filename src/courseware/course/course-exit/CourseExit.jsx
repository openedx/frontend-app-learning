import React, { useEffect } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import CourseCelebration from './CourseCelebration';
import CourseInProgress from './CourseInProgress';
import CourseNonPassing from './CourseNonPassing';
import { COURSE_EXIT_MODES, getCourseExitMode } from './utils';
import messages from './messages';
import { unsubscribeFromGoalReminders } from './data/thunks';

import { useModel } from '../../../generic/model-store';

const CourseExit = () => {
  const intl = useIntl();
  const { courseId } = useSelector(state => state.courseware);
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
      unsubscribeFromGoalReminders(courseId);
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
      <div className="row w-100 mt-2 mb-4 justify-content-end">
        <Button
          variant="outline-primary"
          href={`${getConfig().LMS_BASE_URL}/dashboard`}
        >
          {intl.formatMessage(messages.viewCoursesButton)}
        </Button>
      </div>
      {body}
    </>
  );
};

export default CourseExit;

/* eslint-disable import/prefer-default-export */
import React, {
  useContext, useState, useCallback, useMemo,
} from 'react';
import { AppContext } from '@edx/frontend-platform/react';

import { UserMessagesContext, ALERT_TYPES, useAlert } from '../../generic/user-messages';
import { useModel } from '../../generic/model-store';

import { postCourseEnrollment } from './data/api';

const EnrollmentAlert = React.lazy(() => import('./EnrollmentAlert'));

export function useEnrollmentAlert(courseId) {
  const { authenticatedUser } = useContext(AppContext);
  const course = useModel('courses', courseId);
  const outline = useModel('outline', courseId);
  const enrolledUser = course && course.isEnrolled !== undefined && course.isEnrolled;
  const privateOutline = outline && outline.courseBlocks && !outline.courseBlocks.courses;
  /**
   * This alert should render if
   *    1. the user is not enrolled,
   *    2. the user is authenticated, AND
   *    3. the course is private.
   */
  const isVisible = !enrolledUser && authenticatedUser !== null && privateOutline;
  const payload = {
    canEnroll: outline ? outline.enrollAlert.canEnroll : false,
    courseId,
    extraText: outline ? outline.enrollAlert.extraText : '',
    isStaff: course.isStaff,
  };

  useAlert(isVisible, {
    code: 'clientEnrollmentAlert',
    payload: useMemo(() => payload, Object.values(payload).sort()),
    topic: 'outline',
  });

  return { clientEnrollmentAlert: EnrollmentAlert };
}

export function useEnrollClickHandler(courseId, successText) {
  const [loading, setLoading] = useState(false);
  const { addFlash } = useContext(UserMessagesContext);
  const enrollClickHandler = useCallback(() => {
    setLoading(true);
    postCourseEnrollment(courseId).then(() => {
      addFlash({
        dismissible: true,
        flash: true,
        text: successText,
        type: ALERT_TYPES.SUCCESS,
        topic: 'course',
      });
      setLoading(false);
      global.location.reload();
    });
  }, [courseId]);

  return { enrollClickHandler, loading };
}

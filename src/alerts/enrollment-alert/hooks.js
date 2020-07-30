/* eslint-disable import/prefer-default-export */
import React, {
  useContext, useState, useCallback,
} from 'react';

import { UserMessagesContext, ALERT_TYPES, useAlert } from '../../generic/user-messages';
import { useModel } from '../../generic/model-store';

import { postCourseEnrollment } from './data/api';

const EnrollmentAlert = React.lazy(() => import('./EnrollmentAlert'));

export function useEnrollmentAlert(courseId) {
  const course = useModel('courses', courseId);
  const outline = useModel('outline', courseId);
  const isVisible = course && course.isEnrolled !== undefined && !course.isEnrolled;

  useAlert(isVisible, {
    code: 'clientEnrollmentAlert',
    payload: {
      canEnroll: outline.enrollAlert.canEnroll,
      courseId,
      extraText: outline.enrollAlert.extraText,
      isStaff: course.isStaff,
    },
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

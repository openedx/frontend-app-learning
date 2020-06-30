/* eslint-disable import/prefer-default-export */
import {
  useContext, useState, useCallback,
} from 'react';
import { UserMessagesContext, ALERT_TYPES, useAlert } from '../../user-messages';
import { useModel } from '../../generic/model-store';
import { postCourseEnrollment } from './data/api';


export function useEnrollmentAlert(courseId) {
  const course = useModel('courses', courseId);
  const code = course.isStaff ? 'clientStaffEnrollmentAlert' : 'clientEnrollmentAlert';
  const isVisible = course && course.isEnrolled !== undefined && !course.isEnrolled;

  useAlert(isVisible, {
    code,
    topic: 'course',
  });
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

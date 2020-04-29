/* eslint-disable import/prefer-default-export */
import {
  useContext, useState, useEffect, useCallback,
} from 'react';
import { UserMessagesContext } from '../user-messages';
import { useModel } from '../model-store';
import { postCourseEnrollment } from './data/api';

export function useEnrollmentAlert(courseId) {
  const course = useModel('courses', courseId);
  const { add, remove } = useContext(UserMessagesContext);
  const [alertId, setAlertId] = useState(null);
  const isEnrolled = course && course.isEnrolled;
  useEffect(() => {
    if (course && course.isEnrolled !== undefined) {
      if (!course.isEnrolled && alertId === null) {
        const code = course.isStaff ? 'clientStaffEnrollmentAlert' : 'clientEnrollmentAlert';
        setAlertId(add({
          code,
          topic: 'course',
        }));
      } else if (course.isEnrolled && alertId !== null) {
        remove(alertId);
        setAlertId(null);
      }
    }
    return () => {
      if (alertId !== null) {
        remove(alertId);
      }
    };
  }, [course, isEnrolled]);
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
        type: 'success',
        topic: 'course',
      });
      setLoading(false);
      global.location.reload();
    });
  }, [courseId]);

  return { enrollClickHandler, loading };
}

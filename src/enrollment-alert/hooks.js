/* eslint-disable import/prefer-default-export */
import { useContext, useState, useEffect } from 'react';
import { UserMessagesContext } from '../user-messages';
import { useModel } from '../model-store';

export function useEnrollmentAlert(courseId) {
  const course = useModel('courses', courseId);
  const { add, remove } = useContext(UserMessagesContext);
  const [alertId, setAlertId] = useState(null);
  const isEnrolled = course && course.isEnrolled;
  useEffect(() => {
    if (course && course.isEnrolled !== undefined) {
      if (!course.isEnrolled && alertId === null) {
        if (course.isStaff) {
          setAlertId(add({
            code: 'clientStaffEnrollmentAlert',
            topic: 'course',
          }));
        } else {
          setAlertId(add({
            code: 'clientEnrollmentAlert',
            topic: 'course',
          }));
        }
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

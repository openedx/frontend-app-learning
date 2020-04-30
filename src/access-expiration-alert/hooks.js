/* eslint-disable import/prefer-default-export */
import { useContext, useState, useEffect } from 'react';
import { UserMessagesContext } from '../user-messages';
import { useModel } from '../model-store';

export function useAccessExpirationAlert(courseId) {
  const course = useModel('courses', courseId);
  const { add, remove } = useContext(UserMessagesContext);
  const [alertId, setAlertId] = useState(null);
  const expiredMessage = (course && course.courseExpiredMessage) || null;
  useEffect(() => {
    if (expiredMessage && alertId === null) {
      setAlertId(add({
        code: 'clientAccessExpirationAlert',
        topic: 'course',
        rawHtml: expiredMessage,
      }));
    } else if (alertId !== null) {
      remove(alertId);
      setAlertId(null);
    }
    return () => {
      if (alertId !== null) {
        remove(alertId);
      }
    };
  }, [course, expiredMessage]);
}

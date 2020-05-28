/* eslint-disable import/prefer-default-export */
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { UserMessagesContext, ALERT_TYPES } from '../../user-messages';

export function useLogistrationAlert() {
  const { authenticatedUser } = useContext(AppContext);
  const { add, remove } = useContext(UserMessagesContext);
  const [alertId, setAlertId] = useState(null);
  useEffect(() => {
    if (authenticatedUser === null && alertId === null) {
      setAlertId(add({
        code: 'clientLogistrationAlert',
        dismissible: false,
        type: ALERT_TYPES.ERROR,
        topic: 'course',
      }));
    } else if (authenticatedUser !== null && alertId !== null) {
      remove(alertId);
      setAlertId(null);
    }
    return () => {
      if (alertId !== null) {
        remove(alertId);
      }
    };
  }, [authenticatedUser]);
}

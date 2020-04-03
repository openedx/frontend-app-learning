/* eslint-disable import/prefer-default-export */
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import UserMessagesContext from '../user-messages/UserMessagesContext';

export function useLogistrationAlert() {
  const { authenticatedUser } = useContext(AppContext);
  const { add, remove } = useContext(UserMessagesContext);
  const [alertId, setAlertId] = useState(null);
  useEffect(() => {
    if (authenticatedUser === null && alertId === null) {
      setAlertId(add({
        code: 'clientLogistrationAlert',
        dismissible: false,
        type: 'error',
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

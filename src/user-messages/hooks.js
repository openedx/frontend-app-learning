/* eslint-disable import/prefer-default-export */
import { useContext, useState, useEffect } from 'react';
import UserMessagesContext from './UserMessagesContext';

export function useAlert(isVisible, {
  code, text, topic, type, payload, dismissible,
}) {
  const { add, remove } = useContext(UserMessagesContext);
  const [alertId, setAlertId] = useState(null);

  useEffect(() => {
    if (isVisible && alertId === null) {
      setAlertId(add({
        code, text, topic, type, payload, dismissible,
      }));
    } else if (!isVisible && alertId !== null) {
      remove(alertId);
      setAlertId(null);
    }
    return () => {
      if (alertId !== null) {
        remove(alertId);
      }
    };
  }, [alertId, isVisible, code, text, topic, type, dismissible, payload]);
}

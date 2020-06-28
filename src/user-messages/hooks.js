/* eslint-disable import/prefer-default-export */
import { useContext, useEffect } from 'react';
import UserMessagesContext from './UserMessagesContext';

export function useAlert(isVisible, {
  code, text, topic, type, payload, dismissible,
}) {
  const { add, remove } = useContext(UserMessagesContext);

  useEffect(() => {
    let alertId = null;

    if (isVisible && alertId === null) {
      alertId = add({
        code, text, topic, type, payload, dismissible,
      });
    } else if (!isVisible && alertId !== null) {
      remove(alertId);
      alertId = null;
    }
    return () => {
      if (alertId !== null) {
        remove(alertId);
      }
    };
  }, [isVisible, code, text, topic, type, dismissible, payload]);
}
